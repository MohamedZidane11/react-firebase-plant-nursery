// backend/firebase.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use local service account file (for local development)
const serviceAccountPath = path.join(__dirname, 'FIREBASE_SERVICE_ACCOUNT.json');

try {
  initializeApp({
    credential: cert(serviceAccountPath),
    storageBucket: 'nursery-c5de8.firebasestorage.app' // 🔴 REPLACE with your bucket name
  });
  console.log('✅ Firebase Admin initialized with service account file');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error.message);
  process.exit(1);
}

export const db = getFirestore();
export const adminStorage = getStorage();