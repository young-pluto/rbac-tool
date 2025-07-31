// lib/firebase.js
const admin = require('firebase-admin');
const { serviceAccount } = require('./firebase-config');

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://portfolio-415e1-default-rtdb.asia-southeast1.firebasedatabase.app"
        });
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Firebase admin initialization error:', error);
    }
}

module.exports = admin;