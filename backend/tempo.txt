import express from 'express';
import cors from 'cors';
import { db } from './firebase.js';

const app = express();

// ✅ Corrected: No spaces, correct URL
const allowedOrigins = [
  'https://react-firebase-plant-nursery.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

app.get('/api/nurseries', async (req, res) => {
  try {
    const snapshot = await db.collection('nurseries').get();
    const list = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.published !== false) {
        list.push({ id: doc.id, ...data });
      }
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'فشل تحميل المشاتل' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Working!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});