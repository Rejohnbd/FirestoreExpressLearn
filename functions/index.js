const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

const app = express();

admin.initializeApp();

const config = {
    apiKey: "AIzaSyAuOaK0t2Yc21aqQ07mE3CP5uZU3saSp14",
    authDomain: "socialapp-2019.firebaseapp.com",
    databaseURL: "https://socialapp-2019.firebaseio.com",
    projectId: "socialapp-2019",
    storageBucket: "socialapp-2019.appspot.com",
    messagingSenderId: "829866265222",
    appId: "1:829866265222:web:a068b14663558b13"
}

const firebase = require('firebase');
firebase.initializeApp(config);

app.get('/screams', (req, res) => {
    admin
        .firestore()
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let screams = [];
            data.forEach(doc => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(screams);
        })
        .catch(err => console.error(err));
});



app.post('/scream', (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    admin.firestore()
        .collection('screams')
        .add(newScream)
        .then((doc) => {
            res.json({ message: `document ${doc.id} created successfully` });
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });
});

const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false
}

const isEmail = (email) => {
    const regEx=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) return true;
    else return false;
}

// Signup Route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassord: req.body.confirmPassord,
        handle: req.body.handle
    };

    //Input Field Error Check
    let errors = {};
    
    if(isEmpty(newUser.email)){
        errors.email = 'Must not be empty';
    }else if(!isEmail(newUser.email)){
        errors.email = 'Must be a valid email address';
    }
    if(isEmpty(newUser.password)) errors.password = 'Must not be empty';
    if(newUser.password !== newUser.confirmPassord) errors.confirmPassord = 'Passwords must match';
    if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

    if(Object.keys(errors).length  > 0) return res.status(400).json(errors)

    //Validate data
    let token, userId;
    admin.firestore().doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({ handle: 'This handle is alreary taken.' })
            }else{
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            // return res.status(201).json({ token })
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(), 
                userId
            };
            return admin.firestore().doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/email-already-in-use'){
                return res.status(400).json({ email: 'Email is already in Used' })
            }else{
                return res.status(500).json({ error: err.code })
            }
        });

        // Firebase Auth Create User
    // firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    //     .then(data => {
    //         return res.status(201).json({ message: `User ${data.user.uid} signed up successfully` });
    //     })
    //     .catch( err => {
    //         console.error(err);
    //         return res.status(500).json({ error: err.code });
    //     });
});

exports.api = functions.region('asia-east2').https.onRequest(app);