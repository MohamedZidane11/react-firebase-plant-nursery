// firebaseAdmin.js
import admin from 'firebase-admin';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
  throw new Error('❌ FIREBASE_SERVICE_ACCOUNT is not set in environment variables');
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (err) {
  console.error('Invalid FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
  throw new Error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.firebasestorage.app`,
  });
}

export const adminStorage = admin.storage();
export const adminDb = admin.firestore();