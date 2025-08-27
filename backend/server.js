// server.js
import express from 'express';
import cors from 'cors';
import { db } from './firebase.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// GET all nurseries
app.get('/api/nurseries', async (req, res) => {
  try {
    const nurseriesRef = db.collection('nurseries');
    const snapshot = await nurseriesRef.get();
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new nursery
app.post('/api/nurseries', async (req, res) => {
  try {
    const { name, image, categories, location, services, featured, discount } = req.body;

    // Validation
    if (!name || !image || !location) {
      return res.status(400).json({ message: 'الاسم، الصورة، والموقع مطلوبون' });
    }

    const newNursery = {
      name,
      image,
      categories: categories || [],
      location,
      services: services || [],
      featured: !!featured,
      discount: discount || null,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('nurseries').add(newNursery);
    res.status(201).json({ id: docRef.id, ...newNursery });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET all offers
app.get('/api/offers', async (req, res) => {
  try {
    const offersRef = db.collection('offers');
    const snapshot = await offersRef.get();
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new offer
app.post('/api/offers', async (req, res) => {
  try {
    const { title, description, tags, endDate, discount, highlighted } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'العنوان والوصف مطلوبان' });
    }

    const newOffer = {
      title,
      description,
      tags: tags || [],
      endDate,
      discount: discount || null,
      highlighted: !!highlighted,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('offers').add(newOffer);
    res.status(201).json({ id: docRef.id, ...newOffer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Test route
app.get('/api', (req, res) => {
  res.json({ message: 'Nursery API is running 🌿' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});