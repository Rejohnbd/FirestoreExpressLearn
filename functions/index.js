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

// Signup Route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassord: req.body.confirmPassord,
        handle: req.body.handle
    };

    //Validate data
    

    // Firebase Auth Create User
    firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then(data => {
            return res.status(201).json({ message: `User ${data.user.uid} signed up successfully` });
        })
        .catch( err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
});

exports.api = functions.region('asia-east2').https.onRequest(app);