const { admin } = require('../utils/admin'); 
const config = require('../utils/firebaseConfig');
// const { validateSignupData, validateLoginData } = require('../utils/validators')
const firebase = require('firebase');

firebase.initializeApp(config);


const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false
}

const isEmail = (email) => {
    const regEx=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) return true;
    else return false;
}

exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassord: req.body.confirmPassord,
        handle: req.body.handle
    };

    //Input Field Error Check
    // const { valid, errors } = validateSignupData(newUser);
    // if(!valid) return res.status(400).json(errors);
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
}

exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    // const { valid, errors } = validateLoginData(user);
    // if(!valid) return res.status(400).json(errors);

    let errors = {};

    if(isEmpty(user.email))  errors.email = 'Must not be empty';
    if(isEmpty(user.password))  errors.password = 'Must not be empty';

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({token})
        })
        .catch( err => {
            console.error(err);
            if(err.code === 'auth/wrong-password'){
                return res.status(403).json({ general: 'Wrong Credentials, please try again' });
            } else{
                return res.status(500).json({ error: err.code });
            }
        });
}