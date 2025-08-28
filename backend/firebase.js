// firebase.js
import admin from 'firebase-admin';

// Get the service account JSON string from environment
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
  throw new Error('❌ FIREBASE_SERVICE_ACCOUNT is not set in environment variables');
}

let serviceAccount;
try {
  // Parse the JSON string (Railway passes it as a string)
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (err) {
  console.error('Raw value of FIREBASE_SERVICE_ACCOUNT:', serviceAccountJson); // Debug
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