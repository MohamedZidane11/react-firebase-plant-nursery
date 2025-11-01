// src/pages/SiteSettings.jsx
import { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import axios from 'axios';

const API_BASE = 'https://nurseries.qvtest.com';

const SiteSettings = () => {
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  const [settings, setSettings] = useState({
    title: '',
    subtitle: '',
    heroImage: '',
    benefits: [''],
    contacts: {
      email: '',
      phone: '',
      whatsapp: '',
      address: ''
    },
    footerLinks: [''],
    social: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    about: ['']
  });

  const SEO_PAGE_ORDER = [
    'home',
    'nurseries',
    'offers',
    'contact',
    'register',
    'about',
    'terms',
    'faq',
    'privacy'
  ];

  // Upload image via backend
  const uploadToBackend = async (file, folder) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || 'فشل رفع الصورة');
    }
    const data = await res.json();
    return data.url;
  };

  // Delete image via backend
  const deleteImageFromStorage = async (imageUrl) => {
    try {
      if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) return;
      const response = await fetch(`${API_BASE}/api/delete-file`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl }),
      });
      if (!response.ok) {
        console.warn('Failed to delete image');
      }
    } catch (err) {
      console.warn('Could not delete image:', err);
    }
  };

  // SEO Settings for All Pages
  const [seoPages, setSeoPages] = useState({
    home: { title: '', description: '', keywords: '' },
    nurseries: { title: '', description: '', keywords: '' },
    offers: { title: '', description: '', keywords: '' },
    contact: { title: '', description: '', keywords: '' },
    register: { title: '', description: '', keywords: '' },
    about: { title: '', description: '', keywords: '' },
    terms: { title: '', description: '', keywords: '' },
    faq: { title: '', description: '', keywords: '' },
    privacy: { title: '', description: '', keywords: '' }
  });


  // Load Settings
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load general settings
        const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        }

        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setSettings(data);
          setHeroImagePreview(data.heroImage || '');
        }

        // Load SEO settings
        try {
          const seoResponse = await axios.get(`${API_BASE}/api/seo`);
          setSeoPages(seoResponse.data);
        } catch (seoError) {
          console.log('No SEO data found, using defaults');
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle General Settings Change
  const handleChange = (field, value) => {
    const keys = field.split('.');
    setSettings(prev => {
      const updated = { ...prev };
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  // Handle SEO Change for a specific page
  const handleSeoChange = (page, field, value) => {
    setSeoPages(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [field]: value
      }
    }));
  };

  // Array manipulation functions
  const addArrayItem = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayItem = (field, index, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item))
    }));
  };

  const removeArrayItem = (field, index) => {
    setSettings(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Save General Settings
  const saveSettings = async () => {
    try {
      let heroImageUrl = settings.heroImage;
  
      // Upload new hero image if selected
      if (heroImageFile) {
        if (settings.heroImage) {
          await deleteImageFromStorage(settings.heroImage);
        }
        heroImageUrl = await uploadToBackend(heroImageFile, 'banner_images');
      }
  
      const docRef = doc(db, 'settings', 'site');
      await setDoc(docRef, {
        ...settings,
        heroImage: heroImageUrl,
        updatedAt: new Date(),
        updatedBy: auth.currentUser?.email || 'unknown'
      });
      alert('✅ تم حفظ إعدادات الموقع بنجاح!');
    } catch (err) {
      alert('❌ خطأ في الحفظ: ' + err.message);
    }
  };

  // Save SEO Settings
  const saveSeoSettings = async () => {
    try {
      await axios.post(`${API_BASE}/api/seo`, seoPages);
      alert('✅ تم حفظ إعدادات SEO بنجاح!');
    } catch (err) {
      alert('❌ خطأ في حفظ SEO: ' + err.message);
    }
  };

  // Import SEO from CSV file
  const importSeoFromCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
          alert('الملف فارغ أو غير صالح');
          return;
        }
  
        const headers = lines[0].split(',').map(h => h.trim());
        const required = ['page', 'title', 'description', 'keywords'];
        if (!required.every(r => headers.includes(r))) {
          alert('الملف يجب أن يحتوي على الأعمدة: page, title, description, keywords');
          return;
        }
  
        const csvData = {};
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
          const page = values[headers.indexOf('page')];
          if (!page) continue;
          csvData[page] = {
            title: values[headers.indexOf('title')] || '',
            description: values[headers.indexOf('description')] || '',
            keywords: values[headers.indexOf('keywords')] || ''
          };
        }
  
        // Merge with existing SEO (don't overwrite missing pages)
        setSeoPages(prev => ({ ...prev, ...csvData }));
        alert('✅ تم استيراد بيانات SEO من ملف CSV!');
      } catch (err) {
        console.error('CSV Error:', err);
        alert('❌ خطأ في قراءة ملف CSV. تأكد من التنسيق الصحيح.');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // Import SEO from Excel (Manual Input Helper)
  const importSeoFromExcel = () => {
    const excelData = {
      home: {
        title: 'مشاتل السعودية | اكتشف أجمل النباتات والمشاتل في المملكة',
        description: 'منصة مشاتل السعودية تجمع لك النباتات والزهور من مشاتل المملكة في مكان واحد. تصفّح بسهولة واكتشف أقرب مشتل وخدمات الزراعة والعناية بالنباتات.',
        keywords: 'مشاتل السعودية، نباتات الزينة، مشاتل الرياض، مشاتل جدة، نباتات داخلية، زهور طبيعية، مشاتل المملكة'
      },
      nurseries: {
        title: 'مشاتل المملكة | اكتشف أقرب مشتل حسب مدينتك',
        description: 'تصفح قائمة مشاتل المملكة حسب المدن والأحياء، وابحث بسهولة باستخدام الفلاتر الذكية للوصول إلى المشاتل الأقرب لك مع تفاصيل الموقع والخدمات المتاحة.',
        keywords: 'مشاتل الرياض، مشاتل جدة، مشاتل الطائف، نباتات خارجية، مشاتل قريبة'
      },
      offers: {
        title: 'عروض مشاتل السعودية | خصومات على النباتات والخدمات',
        description: 'تابع أحدث عروض المشاتل في السعودية يوميًا. خصومات على النباتات الداخلية والخارجية، خدمات التركيب، الزراعة، والاستشارات الزراعية بأسعار مميزة.',
        keywords: 'عروض مشاتل، خصومات نباتات، عروض الزهور، تخفيضات الزراعة، عروض السعودية'
      },
      contact: {
        title: 'اتصل بنا | تواصل مع فريق مشاتل السعودية بسهولة',
        description: 'تواصل معنا لأي استفسار أو ملاحظة حول منصة مشاتل السعودية. فريق الدعم جاهز لخدمتك عبر الهاتف أو البريد الإلكتروني أو نموذج التواصل المباشر.',
        keywords: 'اتصل بنا مشاتل السعودية، تواصل، دعم فني، استفسارات'
      },
      register: {
        title: 'سجّل مشتلك في مشاتل السعودية | انضم إلى دليل المشاتل',
        description: 'أضف مشتلك بسهولة إلى منصة مشاتل السعودية لتصل إلى آلاف الزوار. التسجيل مجاني لأصحاب المشاتل والخدمات الزراعية مع ظهور مميز في دليل المشاتل.',
        keywords: 'تسجيل مشتل، إضافة مشتل، سجل مشتلك، انضم إلى دليل المشاتل، مشاتل السعودية'
      },
      about: {
        title: 'منصة مشاتل السعودية لدعم مجال النباتات والمشاتل في المملكة',
        description: 'مشاتل السعودية منصة رقمية تجمع المشاتل والخدمات الزراعية في مكان واحد، بهدف تسهيل وصول العملاء ودعم مجال الزراعة في جميع أنحاء المملكة.',
        keywords: 'منصة مشاتل السعودية، عن مشاتل السعودية، دعم الزراعة، الخدمات الزراعية'
      },
      terms: {
        title: 'شروط الاستخدام | القواعد المنظمة لموقع مشاتل السعودية',
        description: 'باستخدامك لموقع مشاتل السعودية، فإنك توافق على الشروط التي تنظم استخدام المنصة وتضمن تجربة آمنة وموثوقة لجميع المستخدمين والمشاتل المشاركة.',
        keywords: 'شروط الاستخدام، سياسات الموقع، استخدام المنصة، حقوق المستخدم'
      },
      faq: {
        title: 'الأسئلة الشائعة | إجابات حول منصة مشاتل السعودية',
        description: 'تعرف على إجابات أهم الأسئلة حول التسجيل، العروض، وخدمات منصة مشاتل السعودية. كل ما تحتاج معرفته لتبدأ تجربتك بسهولة في عالم النباتات والمشاتل.',
        keywords: 'الأسئلة الشائعة، الدعم، مشاتل السعودية، التسجيل، العروض'
      },
      privacy: {
        title: 'سياسة الخصوصية | حماية بياناتك في مشاتل السعودية',
        description: 'نلتزم في مشاتل السعودية بحماية خصوصيتك. تعرف على كيفية جمع واستخدام بياناتك الشخصية لضمان تجربة آمنة وشفافة لجميع زوار المنصة.',
        keywords: 'سياسة الخصوصية، حماية البيانات، خصوصية المستخدم، بيانات شخصية'
      }
    };

    setSeoPages(excelData);
    alert('✅ تم استيراد بيانات SEO من الملف!');
  };

  // ✅ Loading Animation
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">⚙️ إعدادات الموقع والـ SEO</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'general'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 إعدادات عامة
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'seo'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🔍 إعدادات SEO لجميع الصفحات
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && (
          <div className="space-y-10">
            {/* Hero Section */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">🏠 القسم العلوي (Hero)</h2>
              <div className="space-y-6">
                <input
                  placeholder="العنوان الرئيسي"
                  value={settings.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  placeholder="الوصف تحت العنوان"
                  value={settings.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="hero-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>رفع صورة الهيرو</span>
                        <input
                          id="hero-upload"
                          name="hero-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setHeroImageFile(file);
                              setHeroImagePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                      <p className="pl-1">أو اسحب الملف هنا</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP حتى 10MB</p>
                  </div>
                </div>

                {/* Preview */}
                {heroImagePreview || settings.heroImage ? (
                  <div className="mt-4 flex flex-col items-center">
                    <img
                      src={heroImagePreview || settings.heroImage}
                      alt="معاينة الهيرو"
                      className="w-full h-48 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/800x400/cccccc/999999?text=Image+Not+Found';
                      }}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (settings.heroImage) {
                          await deleteImageFromStorage(settings.heroImage);
                        }
                        setHeroImageFile(null);
                        setHeroImagePreview('');
                        setSettings(prev => ({ ...prev, heroImage: '' }));
                      }}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      حذف الصورة
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">⭐ مزايا الموقع</h2>
              {settings.benefits.map((b, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    value={b}
                    onChange={(e) => updateArrayItem('benefits', i, e.target.value)}
                    placeholder={`مثلاً: توصيل سريع`}
                    className="flex-1 px-4 py-3 border rounded-lg"
                  />
                  <button
                    onClick={() => removeArrayItem('benefits', i)}
                    className="bg-red-100 text-red-600 px-4 rounded-lg hover:bg-red-200"
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

            {/* Contact & Social */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">📞 معلومات الاتصال</h2>
                <div className="space-y-4">
                  <input
                    placeholder="البريد الإلكتروني"
                    value={settings.contacts.email}
                    onChange={(e) => handleChange('contacts.email', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                  <input
                    placeholder="رقم الجوال"
                    value={settings.contacts.phone}
                    onChange={(e) => handleChange('contacts.phone', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                  <input
                    placeholder="رقم واتساب (بدون +)"
                    value={settings.contacts.whatsapp}
                    onChange={(e) => handleChange('contacts.whatsapp', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">📱 الروابط الاجتماعية</h2>
                <div className="space-y-4">
                  <input
                    placeholder="فيسبوك"
                    value={settings.social.facebook}
                    onChange={(e) => handleChange('social.facebook', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                  <input
                    placeholder="إنستغرام"
                    value={settings.social.instagram}
                    onChange={(e) => handleChange('social.instagram', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                  <input
                    placeholder="تويتر"
                    value={settings.social.twitter}
                    onChange={(e) => handleChange('social.twitter', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={saveSettings}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
            >
              💾 حفظ الإعدادات العامة
            </button>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6">
            {/* Import Button */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border-2 border-green-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">📥 استيراد بيانات SEO</h3>
                  <p className="text-gray-600">اختر طريقة الاستيراد:</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={importSeoFromExcel}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                  >
                    من القالب الجاهز
                  </button>
                  
                  {/* CSV Upload */}
                  <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition cursor-pointer">
                    من ملف CSV
                    <input
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) importSeoFromCSV(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* SEO for Each Page */}
            {SEO_PAGE_ORDER.map(pageName => {
              const pageData = seoPages[pageName] || { title: '', description: '', keywords: '' };
              return (
                <div key={pageName} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <span className="text-3xl">
                      {pageName === 'home' && '🏠'}
                      {pageName === 'nurseries' && '🌿'}
                      {pageName === 'offers' && '🎁'}
                      {pageName === 'contact' && '📞'}
                      {pageName === 'register' && '📝'}
                      {pageName === 'about' && 'ℹ️'}
                      {pageName === 'terms' && '📜'}
                      {pageName === 'faq' && '❓'}
                      {pageName === 'privacy' && '🔒'}
                    </span>
                    صفحة {
                      pageName === 'home' ? 'الرئيسية' :
                      pageName === 'nurseries' ? 'المشاتل' :
                      pageName === 'offers' ? 'العروض' :
                      pageName === 'contact' ? 'اتصل بنا' :
                      pageName === 'register' ? 'سجل مشتلك' :
                      pageName === 'about' ? 'من نحن' :
                      pageName === 'terms' ? 'شروط الاستخدام' :
                      pageName === 'faq' ? 'الأسئلة الشائعة' :
                      'سياسة الخصوصية'
                    }
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الصفحة (Title)</label>
                      <input
                        placeholder="عنوان SEO للصفحة"
                        value={pageData.title}
                        onChange={(e) => handleSeoChange(pageName, 'title', e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">طول مثالي: 50-60 حرف</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الوصف (Description)</label>
                      <textarea
                        placeholder="وصف SEO للصفحة"
                        value={pageData.description}
                        onChange={(e) => handleSeoChange(pageName, 'description', e.target.value)}
                        rows="3"
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">طول مثالي: 150-160 حرف</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الكلمات المفتاحية (Keywords)</label>
                      <input
                        placeholder="الكلمات المفتاحية مفصولة بفاصلة"
                        value={pageData.keywords}
                        onChange={(e) => handleSeoChange(pageName, 'keywords', e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">مثال: مشاتل السعودية، نباتات الزينة، مشاتل الرياض</p>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={saveSeoSettings}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-green-800 transition shadow-lg"
            >
              💾 حفظ جميع إعدادات SEO
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteSettings;