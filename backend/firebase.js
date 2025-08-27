// firebase.js
import admin from 'firebase-admin';

// Get the service account from environment variable
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
  throw new Error('❌ FIREBASE_SERVICE_ACCOUNT is not set in environment variables');
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (err) {
  throw new Error('❌ Invalid JSON in FIREBASE_SERVICE_ACCOUNT: ' + err.message);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Get Firestore
const db = admin.firestore();

export { db };