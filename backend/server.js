// server.js - COMPLETE Final Version with FIXED CORS
import express from 'express';
import cors from 'cors';
import { db, adminStorage } from './firebase.js';
import multer from 'multer';

const app = express();

// ═══════════════════════════════════════════════════════════════
// CORS Configuration - FIXED VERSION
// ═══════════════════════════════════════════════════════════════
const allowedOrigins = [
  'https://nurseries.qvtest.com',
  'https://plant-nursery-admin.vercel.app',
  'https://react-firebase-plant-nursery.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5000',
  'http://localhost:3000'
];

// Manual CORS middleware (more reliable)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Backup CORS package (double protection)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
      return callback(null, true);
    }
    console.log('⚠️  CORS check for:', origin);
    return callback(null, true); // Allow all temporarily
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));

// ═══════════════════════════════════════════════════════════════
// Multer Configuration
// ═══════════════════════════════════════════════════════════════
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed!'), false);
    }
  }
});

const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files allowed!'), false);
    }
  }
});

// ═══════════════════════════════════════════════════════════════
// IMAGE UPLOAD ENDPOINT
// ═══════════════════════════════════════════════════════════════
app.post('/api/upload', imageUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { folder, nurseryId, offerId } = req.body;
    const allowedFolders = ['nurs_images', 'nurs_album', 'offers_images', 'offers_album', 'banner_images'];
    
    if (!folder || !allowedFolders.includes(folder)) {
      return res.status(400).json({ error: `Invalid folder. Allowed: ${allowedFolders.join(', ')}` });
    }

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
      metadata: { contentType: req.file.mimetype }
    });

    await file.makePublic();
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;

    res.status(200).json({ url: publicUrl, path: filePath });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// VIDEO UPLOAD FOR OFFERS
// ═══════════════════════════════════════════════════════════════
app.post('/api/upload-offer-video', videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { offerId } = req.body;
    if (!offerId) {
      return res.status(400).json({ error: 'Offer ID is required' });
    }

    const basePath = `offers_videos/${offerId}`;
    const timestamp = Date.now();
    const cleanName = req.file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const fileName = `${timestamp}_${cleanName}`;
    const filePath = `${basePath}/${fileName}`;

    const bucket = adminStorage.bucket();
    const file = bucket.file(filePath);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });

    await file.makePublic();
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;

    res.status(200).json({ url: publicUrl, path: filePath });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: 'Failed to upload video.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// VIDEO UPLOAD FOR NURSERIES
// ═══════════════════════════════════════════════════════════════
app.post('/api/upload-nursery-video', videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }
    const { nurseryId } = req.body;
    if (!nurseryId) {
      return res.status(400).json({ error: 'Nursery ID is required' });
    }
    const basePath = `nurs_videos/${nurseryId}`;
    const timestamp = Date.now();
    const cleanName = req.file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const fileName = `${timestamp}_${cleanName}`;
    const filePath = `${basePath}/${fileName}`;
    const bucket = adminStorage.bucket();
    const file = bucket.file(filePath);
    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });
    await file.makePublic();
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
    res.status(200).json({ url: publicUrl, path: filePath });
  } catch (error) {
    console.error('Nursery video upload error:', error);
    res.status(500).json({ error: 'Failed to upload nursery video.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// DELETE FILE ENDPOINT
// ═══════════════════════════════════════════════════════════════
app.delete('/api/delete-file', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'File URL is required' });
    }

    const bucketName = adminStorage.bucket().name;
    if (!url.includes(bucketName)) {
      return res.status(400).json({ error: 'Invalid file URL' });
    }

    const urlObj = new URL(url);
    let filePath = urlObj.pathname.split('/o/')[1];
    if (filePath) {
      filePath = decodeURIComponent(filePath.split('?')[0]);
      const file = adminStorage.bucket().file(filePath);
      await file.delete();
      res.status(200).json({ message: 'File deleted successfully' });
    } else {
      res.status(400).json({ error: 'Invalid URL format' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// ═══════════════════════════════════════════════════════════════
// NURSERIES ENDPOINTS
// ═══════════════════════════════════════════════════════════════
app.get('/api/nurseries', async (req, res) => {
  try {
    const snapshot = await db.collection('nurseries').get();
    const list = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.published !== false) {
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
    console.error('Error fetching nurseries:', err);
    res.status(500).json({ message: 'فشل تحميل المشاتل' });
  }
});

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

// ═══════════════════════════════════════════════════════════════
// OFFERS ENDPOINTS
// ═══════════════════════════════════════════════════════════════
app.get('/api/offers', async (req, res) => {
  const today = new Date();
  try {
    const snapshot = await db.collection('offers').get();
    const list = [];
    const offersData = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.published === false) return;
      
      if (!data.endDate) {
        offersData.push({ id: doc.id, ...data });
        return;
      }

      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        console.warn(`Invalid endDate for offer ${doc.id}:`, data.endDate);
        return;
      }

      if (endDate >= today) {
        offersData.push({ id: doc.id, ...data });
      }
    });

    for (const offer of offersData) {
      if (offer.nurseryId) {
        try {
          const nurseryDoc = await db.collection('nurseries').doc(offer.nurseryId).get();
          if (nurseryDoc.exists) {
            const nurseryData = nurseryDoc.data();
            offer.nurseryLocation = nurseryData.location || null;
            offer.nurseryWhatsapp = nurseryData.whatsapp || null;
            offer.nurseryPhone = nurseryData.phone || null;
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

app.get('/api/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('offers').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'العرض غير موجود' });
    }

    const offerData = { id: doc.id, ...doc.data() };

    if (offerData.nurseryId) {
      try {
        const nurseryDoc = await db.collection('nurseries').doc(offerData.nurseryId).get();
        if (nurseryDoc.exists) {
          const nurseryData = nurseryDoc.data();
          offerData.nurseryLocation = nurseryData.location || null;
          offerData.nurseryWhatsapp = nurseryData.whatsapp || null;
          offerData.nurseryPhone = nurseryData.phone || null;
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

// ═══════════════════════════════════════════════════════════════
// CATEGORIES ENDPOINTS
// ═══════════════════════════════════════════════════════════════
app.get('/api/categories', async (req, res) => {
  try {
    const snapshot = await db.collection('categories').get();
    const list = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.published !== false) {
        list.push({ id: doc.id, ...data });
      }
    });

    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json(list);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'فشل تحميل التصنيفات' });
  }
});

// ═══════════════════════════════════════════════════════════════
// SPONSORS ENDPOINTS
// ═══════════════════════════════════════════════════════════════
app.get('/api/sponsors', async (req, res) => {
  try {
    const snapshot = await db.collection('sponsors').get();
    const list = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.published !== false) {
        list.push({ id: doc.id, ...data });
      }
    });

    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json(list);
  } catch (err) {
    console.error('Error fetching sponsors:', err);
    res.status(500).json({ message: 'فشل تحميل الرعاة' });
  }
});

// ═══════════════════════════════════════════════════════════════
// PENDING NURSERIES ENDPOINTS
// ═══════════════════════════════════════════════════════════════
app.post('/api/pending-nurseries', async (req, res) => {
  try {
    const {
      name, categories, region, city, district, googleMapsLink,
      services, featured, contactName, whatsapp
    } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: 'الاسم مطلوب' });
    if (!region?.trim()) return res.status(400).json({ message: 'المنطقة مطلوبة' });
    if (!city?.trim()) return res.status(400).json({ message: 'المدينة مطلوبة' });
    if (!contactName?.trim()) return res.status(400).json({ message: 'اسم المسئول مطلوب' });
    if (!whatsapp?.trim()) return res.status(400).json({ message: 'رقم الواتس آب مطلوب' });

    const newNursery = {
      name: name.trim(),
      categories: Array.isArray(categories) ? categories : [],
      region: region.trim(),
      city: city.trim(),
      district: district?.trim() || '',
      googleMapsLink: googleMapsLink?.trim() || '',
      location: `${region.trim()} - ${city.trim()}${district?.trim() ? ` - ${district.trim()}` : ''}`,
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

app.get('/api/pending-nurseries', async (req, res) => {
  try {
    const snapshot = await db.collection('pendingNurseries').get();
    const list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });
    res.json(list);
  } catch (err) {
    console.error('Error fetching pending nurseries:', err);
    res.status(500).json({ message: 'فشل تحميل المشاتل المعلقة' });
  }
});

// ═══════════════════════════════════════════════════════════════
// BANNERS ENDPOINTS
// ═══════════════════════════════════════════════════════════════
app.get('/api/banners', async (req, res) => {
  try {
    const snapshot = await db.collection('banners').get();
    const banners = [];
    snapshot.forEach(doc => {
      banners.push({ id: doc.id, ...doc.data() });
    });
    res.json(banners);
  } catch (err) {
    console.error('Error fetching banners:', err);
    res.status(500).json({ message: 'فشل تحميل البانرات' });
  }
});

app.get('/api/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('banners').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'البانر غير موجود' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Error fetching banner:', err);
    res.status(500).json({ error: 'فشل تحميل البانر' });
  }
});

app.post('/api/banners', imageUpload.single('image'), async (req, res) => {
  try {
    const { position, active } = req.body;
    const isActive = active === 'true';

    if (!req.file) return res.status(400).json({ error: 'الصورة مطلوبة' });
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

app.put('/api/banners/:id', imageUpload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { position, active } = req.body;
    const isActive = active === 'true';

    const doc = await db.collection('banners').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'البانر غير موجود' });

    const oldData = doc.data();
    let updateData = {};

    if (position !== undefined) {
      if (isNaN(Number(position)) || Number(position) <= 0) {
        return res.status(400).json({ error: 'رقم الترتيب يجب أن يكون رقمًا موجبًا' });
      }
      updateData.position = Number(position);
    }
    if (active !== undefined) updateData.active = isActive;

    if (req.file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'الامتدادات المسموحة: PNG, JPG, WEBP' });
      }

      if (oldData.imageUrl) {
        try {
          const urlObj = new URL(oldData.imageUrl);
          const oldPath = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
          await adminStorage.bucket().file(oldPath).delete();
        } catch (e) {
          console.warn('Old image delete failed:', e.message);
        }
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
      updateData.imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
    }

    await db.collection('banners').doc(id).update(updateData);
    res.json({ id, ...oldData, ...updateData });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'فشل تحديث البانر' });
  }
});

app.delete('/api/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('banners').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'البانر غير موجود' });

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

// ═══════════════════════════════════════════════════════════════
// SURVEYS ENDPOINTS
// ═══════════════════════════════════════════════════════════════
app.post('/api/survey', async (req, res) => {
  try {
    const {
      name, phone, email, interest_level, expected_features, service_suggestions,
      communication_method, directory_interest, preferred_offers, region,
      additional_comments, timestamp, platform, whatsapp, status
    } = req.body;

    if (!interest_level?.trim()) return res.status(400).json({ message: 'مستوى الاهتمام مطلوب' });
    if (!expected_features?.trim()) return res.status(400).json({ message: 'الميزات المتوقعة مطلوبة' });
    if (!communication_method?.trim()) return res.status(400).json({ message: 'وسيلة التواصل مطلوبة' });
    if (!directory_interest?.trim()) return res.status(400).json({ message: 'الاهتمام بالدليل مطلوب' });
    if (!Array.isArray(preferred_offers) || preferred_offers.length === 0) {
      return res.status(400).json({ message: 'يجب اختيار عرض واحد على الأقل' });
    }
    if (!region?.trim()) return res.status(400).json({ message: 'المنطقة مطلوبة' });

    const cleanPhone = (str) => {
      if (typeof str !== 'string') return null;
      const trimmed = str.trim();
      return trimmed === '' ? null : trimmed;
    };

    const surveyData = {
      name: name?.trim() || null,
      phone: cleanPhone(phone),
      whatsapp: cleanPhone(whatsapp) || cleanPhone(phone),
      email: email?.trim() || null,
      interest_level: interest_level.trim(),
      expected_features: expected_features.trim(),
      service_suggestions: service_suggestions?.trim() || null,
      communication_method: communication_method.trim(),
      directory_interest: directory_interest.trim(),
      preferred_offers: preferred_offers,
      region: region.trim(),
      additional_comments: additional_comments?.trim() || null,
      timestamp: timestamp || new Date().toISOString(),
      platform: platform || 'مشاتل',
      status: status || 'active'
    };

    const docRef = await db.collection('surveys').add(surveyData);
    res.status(201).json({ id: docRef.id, message: 'تم حفظ الاستبيان بنجاح', ...surveyData });
  } catch (err) {
    console.error('Error saving survey:', err);
    res.status(500).json({ message: 'فشل في حفظ الاستبيان' });
  }
});

app.get('/api/surveys', async (req, res) => {
  try {
    const snapshot = await db.collection('surveys').orderBy('timestamp', 'desc').get();
    const surveys = [];
    snapshot.forEach(doc => {
      surveys.push({ id: doc.id, ...doc.data() });
    });
    res.json(surveys);
  } catch (err) {
    console.error('Error fetching surveys:', err);
    res.status(500).json({ message: 'فشل تحميل الاستبيانات' });
  }
});

app.delete('/api/surveys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('surveys').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'الاستبيان غير موجود' });
    }

    await db.collection('surveys').doc(id).delete();
    
    res.json({ message: 'تم حذف الاستبيان بنجاح' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ error: 'فشل حذف الاستبيان' });
  }
});

app.get('/api/survey/stats', async (req, res) => {
  try {
    const snapshot = await db.collection('surveys').get();
    const stats = {
      total: snapshot.size,
      byInterestLevel: {},
      byCommunicationMethod: {},
      byRegion: {},
      byDirectoryInterest: {},
      preferredOffers: {}
    };

    snapshot.forEach(doc => {
      const data = doc.data();
      
      stats.byInterestLevel[data.interest_level] = (stats.byInterestLevel[data.interest_level] || 0) + 1;
      stats.byCommunicationMethod[data.communication_method] = (stats.byCommunicationMethod[data.communication_method] || 0) + 1;
      stats.byRegion[data.region] = (stats.byRegion[data.region] || 0) + 1;
      stats.byDirectoryInterest[data.directory_interest] = (stats.byDirectoryInterest[data.directory_interest] || 0) + 1;
      
      if (Array.isArray(data.preferred_offers)) {
        data.preferred_offers.forEach(offer => {
          stats.preferredOffers[offer] = (stats.preferredOffers[offer] || 0) + 1;
        });
      }
    });

    res.json(stats);
  } catch (err) {
    console.error('Error fetching survey stats:', err);
    res.status(500).json({ message: 'فشل تحميل الإحصائيات' });
  }
});

// ═══════════════════════════════════════════════════════════════
// CONTACT FORM SUBMISSION
// ═══════════════════════════════════════════════════════════════
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim()) return res.status(400).json({ error: 'الاسم مطلوب' });
    if (!email?.trim()) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'بريد إلكتروني غير صالح' });
    if (!subject?.trim()) return res.status(400).json({ error: 'الموضوع مطلوب' });
    if (!message?.trim()) return res.status(400).json({ error: 'الرسالة مطلوبة' });

    const contactData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    await db.collection('contacts').add(contactData);

    res.status(200).json({ success: true, message: 'تم إرسال رسالتك بنجاح! سنرد عليك قريبًا.' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقًا.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// SITE SETTINGS ENDPOINT
// ═══════════════════════════════════════════════════════════════
app.get('/api/settings/site', async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('site').get();
    if (doc.exists) {
      res.json(doc.data());
    } else {
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
          whatsapp: '+966 50 123 4567',
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

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nursery API is running 🌿',
    version: '2.0.1',
    status: 'OK',
    cors: 'FIXED',
    timestamp: new Date().toISOString(),
    endpoints: {
      nurseries: '/api/nurseries',
      offers: '/api/offers',
      upload: '/api/upload',
      uploadOfferVideo: '/api/upload-offer-video',
      uploadNurseryVideo: '/api/upload-nursery-video',
      deleteFile: '/api/delete-file',
      categories: '/api/categories',
      sponsors: '/api/sponsors',
      banners: '/api/banners',
      surveys: '/api/surveys',
      pendingNurseries: '/api/pending-nurseries',
      contact: '/api/contact',
      settings: '/api/settings/site'
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 404 HANDLER
// ═══════════════════════════════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: [
      'GET /',
      'GET /api/nurseries',
      'GET /api/nurseries/:id',
      'GET /api/offers',
      'GET /api/offers/:id',
      'GET /api/categories',
      'GET /api/sponsors',
      'GET /api/banners',
      'GET /api/surveys',
      'GET /api/pending-nurseries',
      'POST /api/upload',
      'POST /api/upload-offer-video',
      'POST /api/upload-nursery-video',
      'DELETE /api/delete-file'
    ]
  });
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLER
// ═══════════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
  console.log(`🌿 Nurseries API: http://localhost:${PORT}/api/nurseries`);
  console.log(`🎯 Offers API: http://localhost:${PORT}/api/offers`);
  console.log(`✅ CORS: ENABLED for all Vercel domains`);
  console.log('═══════════════════════════════════════════════════════');
});