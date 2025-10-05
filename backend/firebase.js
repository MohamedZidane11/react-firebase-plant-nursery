// firebase.js - Unified Firebase Admin initialization
import admin from 'firebase-admin';

// Get the service account JSON string from environment
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
  throw new Error('❌ FIREBASE_SERVICE_ACCOUNT is not set in environment variables');
}

let serviceAccount;
try {
  // Parse the JSON string (Railway/Vercel passes it as a string)
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (err) {
  console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', err.message);
  throw new Error('Invalid JSON in FIREBASE_SERVICE_ACCOUNT: ' + err.message);
}

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.firebasestorage.app`,
  });
  console.log('✅ Firebase Admin initialized successfully');
}

// Export Firestore and Storage
export const db = admin.firestore();
export const adminStorage = admin.storage();