// src/pages/NurseriesManager.jsx
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { db, auth } from '../firebase/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

const NurseriesManager = () => {
  const [nurseries, setNurseries] = useState([]);
  const [offers, setOffers] = useState([]); // Add state for offers
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const formRef = useRef();

  // ✅ Initial form data WITHOUT discount field, WITH social media
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    categories: [],
    location: '',
    region: '',
    city: '',
    district: '',
    services: [],
    featured: false,
    // discount: null, // Removed discount field
    published: true,
    phone: '',
    // Social media links (optional)
    socialMedia: {
      instagram: '',
      twitter: '',
      facebook: '',
      tiktok: ''
    }
  });

  useLayoutEffect(() => {
    if (showForm && formRef.current && editing) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm, editing]);

  // ✅ Fetch offers
  const fetchOffers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'offers'));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOffers(list);
    } catch (err) {
      console.error('Error fetching offers:', err);
    }
  };

  const fetchNurseries = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'nurseries'));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => (b.featured || 0) - (a.featured || 0));
      setNurseries(list);
    } catch (err) {
      console.error('Error fetching nurseries:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchNurseries(), fetchOffers()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle social media input changes
  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleServiceChange = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image: '',
      categories: [],
      location: '',
      region: '',
      city: '',
      district: '',
      services: [],
      featured: false,
      // discount: null, // Removed discount field
      published: true,
      phone: '',
      // Reset social media
      socialMedia: {
        instagram: '',
        twitter: '',
        facebook: '',
        tiktok: ''
      }
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.location.trim() || !formData.image.trim()) {
      alert('الاسم، الموقع، والصورة مطلوبة');
      return;
    }

    try {
      const data = {
        ...formData,
        // Clean up social media - only save non-empty values
        socialMedia: Object.fromEntries(
          Object.entries(formData.socialMedia).filter(([_, value]) => value.trim() !== '')
        ),
        // discount: formData.discount ? Number(formData.discount) : null, // Removed discount handling
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.email
      };

      if (editing) {
        await updateDoc(doc(db, 'nurseries', editing), data);
        alert('تم تحديث المشتل!');
      } else {
        await addDoc(collection(db, 'nurseries'), {
          ...data,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.email
        });
        alert('تم إضافة المشتل!');
      }

      resetForm();
      fetchNurseries();
    } catch (err) {
      alert('خطأ في الحفظ: ' + err.message);
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشتل؟')) return;
    try {
      await deleteDoc(doc(db, 'nurseries', id));
      alert('تم الحذف!');
      fetchNurseries();
    } catch (err) {
      alert('خطأ في الحذف: ' + err.message);
    }
  };

  const handleEdit = (nursery) => {
    setFormData({
      name: nursery.name,
      image: nursery.image,
      categories: nursery.categories || [],
      location: nursery.location,
      region: nursery.region || '',
      city: nursery.city || '',
      district: nursery.district || '',
      services: nursery.services || [],
      featured: nursery.featured || false,
      // discount: nursery.discount, // Removed discount field
      published: nursery.published !== false,
      phone: nursery.phone || '',
      // Social media - provide defaults if not exists
      socialMedia: {
        instagram: nursery.socialMedia?.instagram || '',
        twitter: nursery.socialMedia?.twitter || '',
        facebook: nursery.socialMedia?.facebook || '',
        tiktok: nursery.socialMedia?.tiktok || ''
      }
    });
    setEditing(nursery.id);
    setShowForm(true);
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;

    // Update location
    setFormData(prev => ({
      ...prev,
      location: value
    }));

    // Parse and auto-fill region, city, district
    const parts = value.split('-').map(part => part.trim());

    if (parts.length === 3) {
      setFormData(prev => ({
        ...prev,
        region: parts[0],
        city: parts[1],
        district: parts[2]
      }));
    } else if (parts.length === 2) {
      setFormData(prev => ({
        ...prev,
        city: parts[0],
        district: parts[1],
        region: '' // Optional: set default region
      }));
    } else if (parts.length === 1) {
      setFormData(prev => ({
        ...prev,
        city: parts[0],
        region: '',
        district: ''
      }));
    } else {
      // If empty or invalid
      setFormData(prev => ({
        ...prev,
        region: '',
        city: '',
        district: ''
      }));
    }
  };

  // Helper function to get discount for a nursery
  const getNurseryDiscount = (nurseryId) => {
    // Find active offers for this nursery
    const activeOffers = offers.filter(offer => 
      offer.nurseryId === nurseryId && 
      offer.published !== false && 
      !isExpired(offer.endDate) &&
      offer.discount > 0 // Only consider offers with discount greater than 0
    );
    
    // Return the highest discount if multiple offers exist
    if (activeOffers.length > 0) {
      return Math.max(...activeOffers.map(offer => offer.discount));
    }
    return null;
  };

  // Helper function to check if offer is expired
  const isExpired = (endDateStr) => {
    if (!endDateStr) return false;
    const end = new Date(endDateStr);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return end < now;
  };

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">إدارة المشاتل</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            + إضافة مشتل جديد
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div ref={formRef} className="bg-white p-8 rounded-2xl shadow-lg mb-8 border border-green-100">
            <h2 className="text-2xl font-bold mb-6">{editing ? 'تعديل مشتل' : 'إضافة مشتل جديد'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المشتل</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="مثل: مشتل الزهور"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصورة</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="https://example.com/image.jpg      "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الموقع</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleLocationChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="مثل: منطقة الرياض - الرياض - حي النخيل"
                  />
                </div>
                {/* Contact Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="+966 55 123 4567"
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">روابط وسائل التواصل الاجتماعي (اختياري)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">إنستغرام</label>
                    <input
                      type="url"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">تويتر (X)</label>
                    <input
                      type="url"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">فيسبوك</label>
                    <input
                      type="url"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">تيك توك</label>
                    <input
                      type="url"
                      value={formData.socialMedia.tiktok}
                      onChange={(e) => handleSocialMediaChange('tiktok', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="https://tiktok.com/@username"
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التصنيفات</label>

                {/* Primary Categories */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">التصنيف الرئيسي</h4>
                  <div className="flex flex-wrap gap-2">
                    {['مشاتل', 'مشاتل مختلطة', 'أدوات الزراعة'].map((cat) => (
                      <label key={cat} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat)}
                          onChange={() => handleCategoryChange(cat)}
                          className="mr-2 h-4 w-4 text-green-600"
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Other Categories */}
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2">تصنيفات أخرى (اختياري)</h4>
                  <div className="flex flex-wrap gap-2">
                    {['نباتات داخلية', 'نباتات خارجية', 'زهور', 'نخيل', 'معدات'].map((cat) => (
                      <label key={cat} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat)}
                          onChange={() => handleCategoryChange(cat)}
                          className="mr-2 h-4 w-4 text-green-600"
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الخدمات (اختياري)</label>
                <div className="flex flex-wrap gap-2">
                  {['delivery', 'consultation', 'maintenance', 'installation'].map((svc) => {
                    const labelMap = {
                      delivery: 'التوصيل',
                      consultation: 'الاستشارات',
                      maintenance: 'الصيانة',
                      installation: 'التركيب',
                    };
                    return (
                      <label key={svc} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.services.includes(svc)}
                          onChange={() => handleServiceChange(svc)}
                          className="mr-2 h-4 w-4 text-green-600"
                        />
                        <span className="text-sm">{labelMap[svc]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-green-600"
                  />
                  <span className="text-sm">مميز</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-green-600"
                  />
                  <span className="text-sm">منشور</span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  {editing ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Nurseries List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">المشاتل ({nurseries.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {nurseries.length === 0 ? (
              <p className="p-8 text-center text-gray-500">لا توجد مشاتل.</p>
            ) : (
              nurseries.map((nursery) => {
                // Get discount from offers for this nursery
                const discount = getNurseryDiscount(nursery.id);
                
                return (
                  <div key={nursery.id} className="p-6 hover:bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={nursery.image}
                        alt={nursery.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/100x100/d1f7c4/4ade80?text=No+Image';
                        }}
                      />
                      <div>
                        <h3 className="font-bold text-gray-800">{nursery.name}</h3>
                        <p className="text-sm text-gray-600">{nursery.location}</p>
                        {discount !== null && (
                          <span className="text-orange-500 text-sm">خصم {discount}%</span>
                        )}
                        {/* Display social media count */}
                        {nursery.socialMedia && (
                          <div className="flex gap-1 mt-1">
                            {nursery.socialMedia.instagram && (
                              <span className="text-blue-400 text-xs">📷</span>
                            )}
                            {nursery.socialMedia.twitter && (
                              <span className="text-blue-400 text-xs">🐦</span>
                            )}
                            {nursery.socialMedia.facebook && (
                              <span className="text-blue-600 text-xs">📘</span>
                            )}
                            {nursery.socialMedia.tiktok && (
                              <span className="text-black text-xs">🎵</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                      {nursery.featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          مميز
                        </span>
                      )}
                      {nursery.published !== false ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          منشور
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          غير منشور
                        </span>
                      )}
                      <button
                        onClick={() => handleEdit(nursery)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm px-3 py-1 rounded transition"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(nursery.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-800 text-sm px-3 py-1 rounded transition"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseriesManager;