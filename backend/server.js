// server.js - Full working version with nurseries & offers
import express from 'express';
import cors from 'cors';
import { db } from './firebase.js';

const app = express();

// ✅ CORS: Fix trailing spaces in allowedOrigins
const allowedOrigins = [
  'https://react-firebase-plant-nursery.vercel.app', // ✅ No trailing spaces
  'https://plant-nursery-admin.vercel.app',
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
        // Convert Firestore Timestamps to ISO strings
        const cleanData = { ...data };
        if (cleanData.createdAt && typeof cleanData.createdAt.toDate === 'function') {
          cleanData.createdAt = cleanData.createdAt.toDate().toISOString();
        }
        if (cleanData.updatedAt && typeof cleanData.updatedAt.toDate === 'function') {
          cleanData.updatedAt = cleanData.updatedAt.toDate().toISOString();
        }
        list.push({ id: doc.id, ...cleanData });
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
      // Remove image validation entirely, or log but don't block
      //if (!image?.trim()) return res.status(400).json({ message: 'الصورة مطلوبة' });
      if (!location?.trim()) return res.status(400).json({ message: 'الموقع مطلوب' });
      if (!contactName?.trim()) return res.status(400).json({ message: 'اسم المسئول مطلوب' });
      if (!whatsapp?.trim()) return res.status(400).json({ message: 'رقم الواتس آب مطلوب' });

      // Save to Firestore
      const newNursery = {
        name: name.trim(),
        // Remove image validation entirely, or log but don't block
        //image: image.trim(),
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
  
  // ✅ GET site settings
app.get('/api/settings/site', async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('site').get();
    if (doc.exists) {
      res.json(doc.data());
    } else {
      // Return defaults if not set
      res.json({
        title: 'أكبر منصة للمشاتل في المملكة',
          subtitle: 'اكتشف أكثر من 500 مشتل ومتجر لأدوات الزراعة في مكان واحد',
          heroImage: 'https://placehold.co/1200x600/10b981/ffffff?text=Hero+Image',
          benefits: ['معلومات كاملة', 'تواصل مباشر', 'خدمات مجانية'],
          seo: {
            title: 'مشاتل النباتات في السعودية | Plant Nursery Finder',
            description: 'أكبر منصة تجمع مشاتل النباتات وأدوات الزراعة في المملكة.',
            ogImage: 'https://placehold.co/1200x630/10b981/ffffff?text=OG+Image'
          },
          contacts: {
            email: 'info@nurseries.sa',
            phone: '0551234567',
            whatsapp: '+4567 123 50 966',
            address: 'الرياض، المملكة العربية السعودية'
          },
          footerLinks: ['الرئيسية', 'المشاتل', 'العروض', 'سجل مشتلك'],
          social: {
            facebook: 'nursery.sa',
            instagram: 'nursery.sa',
            twitter: 'nursery_sa'
          },
          title: 'منصة المشاتل تجمع أفضل المشاتل ومحلات أدوات الزراعة في مكان واحد'
      });
    }
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ message: 'فشل تحميل الإعدادات' });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});