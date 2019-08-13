const functions = require('firebase-functions');
const FBAuth = require('./utils/FBAuth');
const { 
    signup, 
    login, 
    uploadImage, 
    addUserDetails,
    getAuthenticatedUser
} = require('./handlers/users');
const { 
    getAllScreams, 
    postOneScream,
    getScream
} = require('./handlers/screams');
const express = require('express');
const app = express();

//Scream Routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);

// Signup Route
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

exports.api = functions.region('us-central1').https.onRequest(app);