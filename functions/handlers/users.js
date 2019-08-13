const { admin } = require('../utils/admin'); 
const config = require('../utils/firebaseConfig');
const { validateSignupData, validateLoginData, reduceUserDetails } = require('../utils/validators')
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
        confirmPassword: req.body.confirmPassword,
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
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match';
    if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

    if(Object.keys(errors).length  > 0) return res.status(400).json(errors)

    const noImg = 'userimage.jpg';
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
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`, 
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

exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);

    admin.firestore().doc(`/users/${req.user.handle}`).update(userDetails)
        .then(() => {
            return res.json({ message: 'Details added successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

exports.getAuthenticatedUser = (req, res) => {
    let userData = {};
    admin.firestore().doc(`/users/${req.user.handle}`).get()
        .then(doc => {
            if(doc.exists){
                userData.credentials = doc.data();
                return admin.firestore().collection('likes').where('userHandle', '==', req.user.handle).get()
            }
        })
        .then(data => {
            userData.like = [];
            data.forEach(doc => {
                userData.like.push(doc.data())
            });
            return res.json(userData);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: req.headers });

    let imageFileName;
    let imageToBeUploaded = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype ) => {
        // console.log(fieldname);
        // console.log(filename);
        // console.log(mimetype);
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Wrong File Type Submitted' })
        }
        //my.image.png
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(Math.random()*1000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('finish', () => {
        admin.storage().bucket().upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
        .then(() => {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
            return admin.firestore().doc(`/users/${req.user.handle}`).update({ imageUrl })
        })
        .then(() => {
            return res.json({ message: 'Image Upload Successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code })
        });
    });
    busboy.end(req.rawBody);
};