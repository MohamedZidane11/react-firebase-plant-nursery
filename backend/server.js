// server.js - Full working version with nurseries & offers
import express from 'express';
import cors from 'cors';
import { db } from './firebase.js';

const app = express();

// ✅ CORS: Fix trailing spaces in allowedOrigins
const allowedOrigins = [
  'https://react-firebase-plant-nursery.vercel.app', // ✅ No trailing spaces
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '10mb' }));

// ✅ GET all nurseries
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

    if (!doc.exists) {
      return res.status(404).json({ message: 'المشتل غير موجود' });
    }

    const data = doc.data();
    if (data.published === false) {
      return res.status(404).json({ message: 'المشتل غير منشور' });
    }

    res.json({ id: doc.id, ...data });
  } catch (err) {
    console.error('Error fetching nursery:', err);
    res.status(500).json({ message: 'فشل تحميل المشتل' });
  }
});

// ✅ GET all offers
app.get('/api/offers', async (req, res) => {
  const today = new Date();
  try {
    const snapshot = await db.collection('offers').get();
    const list = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.published === false) return;

      // If no end date → active
      if (!data.endDate) {
        list.push({ id: doc.id, ...data });
        return;
      }

      // Parse end date
      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        console.warn(`Invalid endDate for offer ${doc.id}:`, data.endDate);
        return;
      }

      // Check if not expired
      if (endDate >= today) {
        list.push({ id: doc.id, ...data });
      }
    });

    res.json(list);
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(500).json({ message: 'فشل تحميل العروض' });
  }
});

// ✅ GET single offer by ID
app.get('/api/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('offers').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'العرض غير موجود' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Error fetching offer:', err);
    res.status(500).json({ message: 'فشل تحميل العرض' });
  }
});

// ✅ GET all published categories
app.get('/api/categories', async (req, res) => {
  try {
    const snapshot = await db.collection('categories').get();
    const list = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.published !== false) {
        list.push({
          id: doc.id,
          ...data
        });
      }
    });

    // Sort by order
    list.sort((a, b) => a.order - b.order);

    res.json(list);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'فشل تحميل التصنيفات' });
  }
});

// ✅ GET all published sponsors
app.get('/api/sponsors', async (req, res) => {
  try {
    const snapshot = await db.collection('sponsors').get();
    const list = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.published !== false) {
        list.push({
          id: doc.id,
          ...data
        });
      }
    });

    // Sort by order
    list.sort((a, b) => a.order - b.order);

    res.json(list);
  } catch (err) {
    console.error('Error fetching sponsors:', err);
    res.status(500).json({ message: 'فشل تحميل الرعاة' });
  }
});

// ✅ POST new pending nursery
  app.post('/api/pending-nurseries', async (req, res) => {
    try {
      const {
        name,
        image,
        categories,
        location,
        services,
        featured,
        contactName,
        whatsapp
      } = req.body;

      // Validation
      if (!name?.trim()) return res.status(400).json({ message: 'الاسم مطلوب' });
      if (!image?.trim()) return res.status(400).json({ message: 'الصورة مطلوبة' });
      if (!location?.trim()) return res.status(400).json({ message: 'الموقع مطلوب' });
      if (!contactName?.trim()) return res.status(400).json({ message: 'اسم المسئول مطلوب' });
      if (!whatsapp?.trim()) return res.status(400).json({ message: 'رقم الواتس آب مطلوب' });

      // Save to Firestore
      const newNursery = {
        name: name.trim(),
        image: image.trim(),
        categories: Array.isArray(categories) ? categories : [],
        location: location.trim(),
        services: Array.isArray(services) ? services : [],
        featured: !!featured,
        contactName: contactName.trim(),
        whatsapp: whatsapp.trim(),
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };

      const docRef = await db.collection('pendingNurseries').add(newNursery);

      res.status(201).json({ id: docRef.id, ...newNursery });
    } catch (err) {
      console.error('Error saving pending nursery:', err);
      res.status(500).json({ message: 'فشل في حفظ البيانات' });
    }
  });

// ✅ Health check
app.get('/', (req, res) => {
  res.json({ message: 'Nursery API is running 🌿' });
});

// ✅ GET all pending nurseries (for admin)
  app.get('/api/pending-nurseries', async (req, res) => {
    try {
      const snapshot = await db.collection('pendingNurseries').get();
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: 'فشل تحميل المشاتل المعلقة' });
    }
  });
  
// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});