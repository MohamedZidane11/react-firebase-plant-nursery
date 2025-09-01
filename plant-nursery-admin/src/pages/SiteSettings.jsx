import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { serverTimestamp } from 'firebase/firestore';

const SiteSettings = () => {
  const [settings, setSettings] = useState({
    title: '',
    subtitle: '',
    heroImage: '',
    benefits: [''],
    seo: { title: '', description: '', ogImage: '' },
    contacts: { email: '', phone: '', whatsapp: '' },
    footerLinks: [''],
    social: { instagram: '', twitter: '', tiktok: '', snapchat: '' }
  });

  const fetchSettings = async () => {
    const docRef = doc(db, 'settings', 'site');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      setSettings(snap.data());
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      path.split('.').reduce((obj, key, i, arr) => {
        if (i === arr.length - 1) obj[key] = value;
        return obj[key];
      }, newSettings);
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
    const docRef = doc(db, 'settings', 'site');
    await setDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser.email
    });
    alert('تم حفظ الإعدادات!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">إعدادات الموقع</h1>

        <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
          {/* Hero */}
          <div>
            <h2 className="text-xl font-bold mb-4">العنوان والوصف (القسم العلوي)</h2>
            <input
              placeholder="العنوان"
              value={settings.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              placeholder="الوصف"
              value={settings.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              placeholder="رابط صورة الهيرو"
              value={settings.heroImage}
              onChange={(e) => handleChange('heroImage', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Benefits */}
          <div>
            <h2 className="text-xl font-bold mb-4">مزايا الموقع</h2>
            {settings.benefits.map((b, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={b}
                  onChange={(e) => updateArrayItem('benefits', i, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={() => removeArrayItem('benefits', i)}
                  className="bg-red-100 text-red-600 px-3 py-3 rounded-lg"
                >
                  حذف
                </button>
              </div>
            ))}
            <button onClick={() => addArrayItem('benefits')} className="bg-green-100 text-green-600 px-4 py-2 rounded-lg">
              + إضافة ميزة
            </button>
          </div>

          {/* SEO */}
          <div>
            <h2 className="text-xl font-bold mb-4">إعدادات SEO</h2>
            <input
              placeholder="عنوان SEO"
              value={settings.seo.title}
              onChange={(e) => handleChange('seo.title', e.target.value)}
              className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <textarea
              placeholder="وصف SEO"
              value={settings.seo.description}
              onChange={(e) => handleChange('seo.description', e.target.value)}
              rows="3"
              className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              placeholder="رابط صورة OG"
              value={settings.seo.ogImage}
              onChange={(e) => handleChange('seo.ogImage', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-xl font-bold mb-4">معلومات الاتصال</h2>
            <input
              placeholder="البريد الإلكتروني"
              value={settings.contacts.email}
              onChange={(e) => handleChange('contacts.email', e.target.value)}
              className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              placeholder="الهاتف"
              value={settings.contacts.phone}
              onChange={(e) => handleChange('contacts.phone', e.target.value)}
              className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              placeholder="واتساب (رقم)"
              value={settings.contacts.whatsapp}
              onChange={(e) => handleChange('contacts.whatsapp', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Footer Links */}
          <div>
            <h2 className="text-xl font-bold mb-4">روابط التذييل</h2>
            {settings.footerLinks.map((link, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={link}
                  onChange={(e) => updateArrayItem('footerLinks', i, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={() => removeArrayItem('footerLinks', i)}
                  className="bg-red-100 text-red-600 px-3 py-3 rounded-lg"
                >
                  حذف
                </button>
              </div>
            ))}
            <button onClick={() => addArrayItem('footerLinks')} className="bg-green-100 text-green-600 px-4 py-2 rounded-lg">
              + إضافة رابط
            </button>
          </div>

          {/* Social */}
          <div>
            <h2 className="text-xl font-bold mb-4">الروابط الاجتماعية</h2>
            <input
              placeholder="إنستغرام"
              value={settings.social.instagram}
              onChange={(e) => handleChange('social.instagram', e.target.value)}
              className="w-full mb-2 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              placeholder="تويتر"
              value={settings.social.twitter}
              onChange={(e) => handleChange('social.twitter', e.target.value)}
              className="w-full mb-2 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              placeholder="تيك توك"
              value={settings.social.tiktok}
              onChange={(e) => handleChange('social.tiktok', e.target.value)}
              className="w-full mb-2 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              placeholder="سناب شات"
              value={settings.social.snapchat}
              onChange={(e) => handleChange('social.snapchat', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <button
            onClick={saveSettings}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium"
          >
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;