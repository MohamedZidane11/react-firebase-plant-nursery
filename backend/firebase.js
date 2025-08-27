// firebase.js
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🔗 Correct path to your service account key
const serviceAccountPath = join(__dirname, 'firebase-service-account.json');

// ✅ Read and parse the file manually
let serviceAccount;
try {
  const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(fileContent);
} catch (err) {
  console.error('❌ Error reading service account file:', err.message);
  process.exit(1);
}

// ✅ Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// 🔥 Get Firestore
const db = admin.firestore();

export { db };