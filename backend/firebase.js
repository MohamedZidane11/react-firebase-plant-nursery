// backend/firebase.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Support both local file and environment variable
let credential;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // For production (Vercel/Railway) - use environment variable
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = cert(serviceAccount);
    console.log('✅ Using Firebase credentials from environment variable');
  } catch (error) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', error.message);
    process.exit(1);
  }
} else {
  // For local development - use file
  const serviceAccountPath = path.join(__dirname, 'FIREBASE_SERVICE_ACCOUNT.json');
  credential = cert(serviceAccountPath);
  console.log('✅ Using Firebase credentials from local file');
}

try {
  initializeApp({
    credential: credential,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'nursery-c5de8.firebasestorage.app'
  });
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error.message);
  process.exit(1);
}

export const db = getFirestore();
export const adminStorage = getStorage();