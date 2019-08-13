const functions = require('firebase-functions');
const FBAuth = require('./utils/FBAuth');
const { signup, login } = require('./handlers/users');
const { getAllScreams, postOneScream } = require('./handlers/screams');
const express = require('express');
const app = express();

//Scream Routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);

// Signup Route
app.post('/signup', signup);
app.post('/login', login)

exports.api = functions.https.onRequest(app);