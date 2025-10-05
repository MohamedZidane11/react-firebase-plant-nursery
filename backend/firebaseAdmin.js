// firebaseAdmin.js
import admin from 'firebase-admin';
import serviceAccount from './FIREBASE_SERVICE_ACCOUNT.json' assert { type: 'json' };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: serviceAccount.project_id + '.firebasestorage.app',
  });
}

export const adminStorage = admin.storage();
export const adminDb = admin.firestore();