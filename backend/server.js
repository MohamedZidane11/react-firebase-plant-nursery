// server.js - Fixed for Railway
import express from 'express';
import cors from 'cors';
import { db } from './firebase.js';

const app = express();

// ✅ Fix: No trailing spaces in origin
app.use(cors({
  origin: 'https://react-plant-nursery-website.vercel.app' // ✅ Your Vercel app
}));

app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 5000;

// ✅ GET all published nurseries
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

// ✅ GET single nursery by ID
app.get('/api/nurseries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('nurseries').doc(id).get();

    if (!doc.exists || doc.data().published === false) {
      return res.status(404).json({ message: 'المشتل غير موجود أو غير منشور' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب المشتل' });
  }
});

// ✅ GET all active offers
app.get('/api/offers', async (req, res) => {
  const today = new Date();
  try {
    const snapshot = await db.collection('offers').get();
    const list = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.published === false) return;

      if (!data.endDate) {
        list.push({ id: doc.id, ...data });
        return;
      }

      const endDate = new Date(data.endDate);
      if (!isNaN(endDate.getTime()) && endDate >= today) {
        list.push({ id: doc.id, ...data });
      }
    });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'فشل تحميل العروض' });
  }
});

// ✅ Health check
app.get('/', (req, res) => {
  res.json({ message: 'Nursery API is running 🌿' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});