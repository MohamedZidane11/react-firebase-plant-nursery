// src/pages/SiteSettings.jsx
import { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

const SiteSettings = () => {
  const [settings, setSettings] = useState({
    title: '',
    subtitle: '',
    heroImage: '',
    benefits: [''],
    seo: {
      title: '',
      description: '',
      ogImage: ''
    },
    contacts: {
      email: '',
      phone: '',
      whatsapp: ''
    },
    footerLinks: [''],
    social: {
      instagram: '',
      twitter: '',
      tiktok: '',
      snapchat: ''
    }
  });

  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'site');
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setSettings(snap.data());
      } else {
        // Create default if not exists
        const defaultSettings = {
          title: 'أكبر منصة للمشاتل في المملكة',
          subtitle: 'اكتشف أكثر من 500 مشتل ومتجر لأدوات الزراعة في مكان واحد',
          heroImage: 'https://placehold.co/1200x600/10b981/ffffff?text=Hero+Image',
          benefits: ['توصيل سريع', 'أفضل الأسعار', 'استشارات مجانية', 'دعم فني متاح'],
          seo: {
            title: 'مشاتل النباتات في السعودية | Plant Nursery Finder',
            description: 'أكبر منصة تجمع مشاتل النباتات وأدوات الزراعة في المملكة.',
            ogImage: 'https://placehold.co/1200x630/10b981/ffffff?text=OG+Image'
          },
          contacts: {
            email: 'info@nursery.com',
            phone: '0551234567',
            whatsapp: '966551234567'
          },
          footerLinks: ['الرئيسية', 'المشاتل', 'العروض', 'تسجيل مشتل'],
          social: {
            instagram: 'nursery.sa',
            twitter: 'nursery_sa',
            tiktok: 'nursery.sa',
            snapchat: 'nursery-sa'
          }
        };
        await setDoc(docRef, {
          ...defaultSettings,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser?.email || 'unknown'
        });
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const addArrayItem = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayItem = (field, index, value) => {
    const newArr = [...settings[field]];
    newArr[index] = value;
    setSettings(prev => ({ ...prev, [field]: newArr }));
  };

  const removeArrayItem = (field, index) => {
    setSettings(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const saveSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'site');
      await setDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.email || 'unknown'
      });
      alert('تم حفظ إعدادات الموقع بنجاح!');
    } catch (err) {
      alert('خطأ في الحفظ: ' + err.message);
    }
  };

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">إعدادات الموقع</h1>
          <button
            onClick={saveSettings}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition"
          >
            حفظ الإعدادات
          </button>
        </div>

        <div className="space-y-10">
          {/* Hero Section */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">القسم العلوي (Hero)</h2>
            <div className="space-y-6">
              <input
                placeholder="العنوان الرئيسي"
                value={settings.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="الوصف تحت العنوان"
                value={settings.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="رابط صورة الهيرو"
                value={settings.heroImage}
                onChange={(e) => handleChange('heroImage', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">مزايا الموقع</h2>
            {settings.benefits.map((b, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={b}
                  onChange={(e) => updateArrayItem('benefits', i, e.target.value)}
                  placeholder={`مثلاً: توصيل سريع (العنصر ${i + 1})`}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeArrayItem('benefits', i)}
                  className="bg-red-100 text-red-600 px-3 py-3 rounded-lg hover:bg-red-200"
                >
                  حذف
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('benefits')}
              className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200"
            >
              + إضافة ميزة
            </button>
          </div>

          {/* SEO */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">إعدادات SEO</h2>
            <div className="space-y-4">
              <input
                placeholder="عنوان SEO"
                value={settings.seo.title}
                onChange={(e) => handleChange('seo.title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="وصف SEO"
                value={settings.seo.description}
                onChange={(e) => handleChange('seo.description', e.target.value)}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="رابط صورة OG (1200x630)"
                value={settings.seo.ogImage}
                onChange={(e) => handleChange('seo.ogImage', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">معلومات الاتصال</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                placeholder="البريد الإلكتروني"
                value={settings.contacts.email}
                onChange={(e) => handleChange('contacts.email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="رقم الجوال"
                value={settings.contacts.phone}
                onChange={(e) => handleChange('contacts.phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="رقم واتساب (بدون +)"
                value={settings.contacts.whatsapp}
                onChange={(e) => handleChange('contacts.whatsapp', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer Links */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">روابط التذييل</h2>
            {settings.footerLinks.map((link, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={link}
                  onChange={(e) => updateArrayItem('footerLinks', i, e.target.value)}
                  placeholder={`الرابط ${i + 1}`}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeArrayItem('footerLinks', i)}
                  className="bg-red-100 text-red-600 px-3 py-3 rounded-lg hover:bg-red-200"
                >
                  حذف
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('footerLinks')}
              className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200"
            >
              + إضافة رابط
            </button>
          </div>

          {/* Social Media */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">الروابط الاجتماعية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                placeholder="إنستغرام (اسم المستخدم)"
                value={settings.social.instagram}
                onChange={(e) => handleChange('social.instagram', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="تويتر (اسم المستخدم)"
                value={settings.social.twitter}
                onChange={(e) => handleChange('social.twitter', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="تيك توك (اسم المستخدم)"
                value={settings.social.tiktok}
                onChange={(e) => handleChange('social.tiktok', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="سناب شات (اسم المستخدم)"
                value={settings.social.snapchat}
                onChange={(e) => handleChange('social.snapchat', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;