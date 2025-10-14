// server.js - Full working version with nurseries & offers
import express from 'express';
import cors from 'cors';
import { db, adminStorage } from './firebase.js';
import multer from 'multer';
import path from 'path';

const app = express();

// ✅ CORS: Fix trailing spaces in allowedOrigins
const allowedOrigins = [
  'https://react-firebase-plant-nursery.vercel.app', // ✅ No trailing spaces
  'https://plant-nursery-admin.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174'
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

// Configure multer: store in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, etc.) are allowed!'), false);
    }
  }
});

// ✅ POST /api/upload — secure image upload
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { folder, nurseryId, offerId } = req.body;

    // Validate folder
    const allowedFolders = ['nurs_images', 'nurs_album', 'offers_images', 'offers_album'];
    if (!folder || !allowedFolders.includes(folder)) {
      return res.status(400).json({ error: `Invalid folder. Allowed: ${allowedFolders.join(', ')}` });
    }

    // Build path with ID if applicable
    let basePath = folder;
    if (folder.startsWith('nurs_') && nurseryId) {
      basePath = `${folder}/${nurseryId}`;
    } else if (folder.startsWith('offers_') && offerId) {
      basePath = `${folder}/${offerId}`;
    }

    const timestamp = Date.now();
    const cleanName = req.file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const fileName = `${timestamp}_${cleanName}`;
    const filePath = `${basePath}/${fileName}`;

    const bucket = adminStorage.bucket();
    const file = bucket.file(filePath);

    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    await file.makePublic();

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;

    res.status(200).json({
      url: publicUrl,
      path: filePath
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image.' });
  }
});

// DELETE /api/delete-image
app.delete('/api/delete-image', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Validate it's your bucket
    const bucketName = adminStorage.bucket().name;
    if (!url.includes(bucketName)) {
      return res.status(400).json({ error: 'Invalid image URL' });
    }

    // Extract file path from URL
    const urlObj = new URL(url);
    let filePath = urlObj.pathname.split('/o/')[1];
    if (filePath) {
      filePath = decodeURIComponent(filePath.split('?')[0]);
      const file = adminStorage.bucket().file(filePath);
      await file.delete();
      res.status(200).json({ message: 'Image deleted successfully' });
    } else {
      res.status(400).json({ error: 'Invalid URL format' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// ✅ GET all nurseries - with proper timestamp handling
app.get('/api/nurseries', async (req, res) => {
  try {
    const snapshot = await db.collection('nurseries').get();
    const list = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.published !== false) {
        // Convert Firestore Timestamps to ISO strings
        const cleanData = { ...data };
        
        // Handle createdAt
        if (cleanData.createdAt) {
          if (typeof cleanData.createdAt.toDate === 'function') {
            cleanData.createdAt = cleanData.createdAt.toDate().toISOString();
          } else if (cleanData.createdAt._seconds) {
            // Handle pending serverTimestamp
            cleanData.createdAt = new Date(cleanData.createdAt._seconds * 1000).toISOString();
          } else if (typeof cleanData.createdAt === 'string') {
            // Already a string, keep it
            cleanData.createdAt = cleanData.createdAt;
          }
        }
        
        // Handle updatedAt
        if (cleanData.updatedAt) {
          if (typeof cleanData.updatedAt.toDate === 'function') {
            cleanData.updatedAt = cleanData.updatedAt.toDate().toISOString();
          } else if (cleanData.updatedAt._seconds) {
            cleanData.updatedAt = new Date(cleanData.updatedAt._seconds * 1000).toISOString();
          } else if (typeof cleanData.updatedAt === 'string') {
            cleanData.updatedAt = cleanData.updatedAt;
          }
        }
        
        list.push({ id: doc.id, ...cleanData });
      }
    });
    res.json(list);
  } catch (err) {
    console.error('Error fetching nurseries:', err);
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

// ✅ GET all offers with nursery location
app.get('/api/offers', async (req, res) => {
  const today = new Date();
  try {
    const snapshot = await db.collection('offers').get();
    const list = [];

    // Collect all offers first
    const offersData = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.published === false) return;

      // If no end date → active
      if (!data.endDate) {
        offersData.push({ id: doc.id, ...data });
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
        offersData.push({ id: doc.id, ...data });
      }
    });

    // Fetch nursery details for each offer
    for (const offer of offersData) {
      if (offer.nurseryId) {
        try {
          const nurseryDoc = await db.collection('nurseries').doc(offer.nurseryId).get();
          if (nurseryDoc.exists) {
            const nurseryData = nurseryDoc.data();
            offer.nurseryLocation = nurseryData.location || null;
            // Keep nurseryName if it doesn't exist
            if (!offer.nurseryName) {
              offer.nurseryName = nurseryData.name || null;
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch nursery ${offer.nurseryId}:`, err.message);
        }
      }
      list.push(offer);
    }

    res.json(list);
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(500).json({ message: 'فشل تحميل العروض' });
  }
});

// ✅ GET single offer by ID with nursery location
app.get('/api/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('offers').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'العرض غير موجود' });
    }

    const offerData = { id: doc.id, ...doc.data() };

    // Fetch nursery location if nurseryId exists
    if (offerData.nurseryId) {
      try {
        const nurseryDoc = await db.collection('nurseries').doc(offerData.nurseryId).get();
        if (nurseryDoc.exists) {
          const nurseryData = nurseryDoc.data();
          offerData.nurseryLocation = nurseryData.location || null;
          if (!offerData.nurseryName) {
            offerData.nurseryName = nurseryData.name || null;
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch nursery ${offerData.nurseryId}:`, err.message);
      }
    }

    res.json(offerData);
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

// GET all banners (for admin & frontend)
app.get('/api/banners', async (req, res) => {
  try {
    const snapshot = await db.collection('banners').get();
    const banners = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      banners.push({ id: doc.id, ...data });
    });
    res.json(banners);
  } catch (err) {
    console.error('Error fetching banners:', err);
    res.status(500).json({ message: 'فشل تحميل البانرات' });
  }
});

// POST: Create new banner
app.post('/api/banners', upload.single('image'), async (req, res) => {
  try {
    const { position, active } = req.body;
    const isActive = active === 'true';

    if (!req.file) {
      return res.status(400).json({ error: 'الصورة مطلوبة' });
    }
    if (!position || isNaN(Number(position)) || Number(position) <= 0) {
      return res.status(400).json({ error: 'رقم الترتيب مطلوب ويجب أن يكون رقمًا موجبًا' });
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'الامتدادات المسموحة: PNG, JPG, WEBP' });
    }

    const timestamp = Date.now();
    const cleanName = req.file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const fileName = `${timestamp}_${cleanName}`;
    const filePath = `banner_images/${fileName}`;

    const bucket = adminStorage.bucket();
    const file = bucket.file(filePath);
    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });
    await file.makePublic();
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;

    const bannerData = {
      imageUrl,
      position: Number(position),
      active: isActive,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('banners').add(bannerData);
    res.status(201).json({ id: docRef.id, ...bannerData });
  } catch (error) {
    console.error('Error saving banner:', error);
    res.status(500).json({ error: 'فشل حفظ البانر' });
  }
});

// PUT: Update existing banner
app.put('/api/banners/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { position, active } = req.body;
    const isActive = active === 'true';

    const doc = await db.collection('banners').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'البانر غير موجود' });
    }

    const oldData = doc.data();
    let updateData = {};

    if (position !== undefined) {
      if (isNaN(Number(position)) || Number(position) <= 0) {
        return res.status(400).json({ error: 'رقم الترتيب يجب أن يكون رقمًا موجبًا' });
      }
      updateData.position = Number(position);
    }

    if (active !== undefined) {
      updateData.active = isActive;
    }

    if (req.file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'الامتدادات المسموحة: PNG, JPG, WEBP' });
      }

      // Delete old image
      if (oldData.imageUrl) {
        try {
          const urlObj = new URL(oldData.imageUrl);
          const oldPath = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
          await adminStorage.bucket().file(oldPath).delete();
        } catch (e) {
          console.warn('Old image delete failed:', e.message);
        }
      }

      // Upload new image
      const timestamp = Date.now();
      const cleanName = req.file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
      const fileName = `${timestamp}_${cleanName}`;
      const filePath = `banner_images/${fileName}`;

      const bucket = adminStorage.bucket();
      const file = bucket.file(filePath);
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype }
      });
      await file.makePublic();
      updateData.imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
    }

    await db.collection('banners').doc(id).update(updateData);
    res.json({ id, ...oldData, ...updateData });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'فشل تحديث البانر' });
  }
});

// DELETE banner
app.delete('/api/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('banners').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'البانر غير موجود' });
    }

    const data = doc.data();
    if (data.imageUrl) {
      try {
        const urlObj = new URL(data.imageUrl);
        const filePath = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
        await adminStorage.bucket().file(filePath).delete();
      } catch (e) {
        console.warn('Image delete failed:', e.message);
      }
    }

    await db.collection('banners').doc(id).delete();
    res.json({ message: 'تم حذف البانر بنجاح' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ error: 'فشل حذف البانر' });
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
        }
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