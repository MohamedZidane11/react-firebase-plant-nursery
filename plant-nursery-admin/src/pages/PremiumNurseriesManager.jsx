// src/pages/PremiumNurseriesManager.jsx
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { db, auth } from '../firebase/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

const PremiumNurseriesManager = () => {
  const [allNurseries, setAllNurseries] = useState([]);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const formRef = useRef();

  const API_BASE = 'https://nurseries.qvtest.com';

  // Delete file from storage
  const deleteFileFromStorage = async (fileUrl) => {
    try {
      if (!fileUrl || !fileUrl.includes('firebasestorage.googleapis.com')) return;
      const response = await fetch(`${API_BASE}/api/delete-file`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fileUrl }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.warn('Failed to delete file:', error.error || 'Unknown error');
      }
    } catch (err) {
      console.warn('Could not delete file:', err);
    }
  };

  // Upload image using existing /api/upload
  const uploadImageToBackend = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'prem_nurs_images'); // ← KEY CHANGE
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

  const [formData, setFormData] = useState({
    name: '',
    type: 'internal',
    nurseryId: '',
    externalUrl: '',
    logo: '',
    description: '',
    order: 0,
    published: true
  });

  // fetch nurseries list
  useEffect(() => {
    const fetchNurseries = async () => {
      try {
        const API_BASE = 'https://nurseries.qvtest.com';
        const response = await fetch(`${API_BASE}/api/nurseries`);
        if (response.ok) {
          const data = await response.json();
          const sorted = (Array.isArray(data) ? data : [])
            .sort((a, b) => a.name.localeCompare(b.name));
          setAllNurseries(sorted);
        }
      } catch (err) {
        console.error('Failed to load nurseries:', err);
      }
    };
    fetchNurseries();
  }, []);

  // Auto-scroll to form
  useLayoutEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showForm]);

  const fetchItems = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'premiumNurseries'));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => a.order - b.order);
      setItems(list);
    } catch (err) {
      console.error('Error fetching premium nurseries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'internal',
      nurseryId: '',
      externalUrl: '',
      logo: '',
      description: '',
      order: items.length,
      published: true
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate name
    if (!formData.name.trim()) {
      alert('الاسم مطلوب');
      return;
    }
  
    // Validate type-specific fields
    if (formData.type === 'internal' && !formData.nurseryId) {
      alert('يرجى اختيار مشتل من القائمة');
      return;
    }
    if (formData.type === 'external' && !formData.externalUrl?.trim()) {
      alert('يرجى إدخال رابط المشتل الخارجي');
      return;
    }
  
    // Validate image: either uploaded file or existing logo
    if (!logoFile && !formData.logo?.trim()) {
      alert('الرجاء رفع شعار أو التأكد من وجود رابط صورة');
      return;
    }
  
    try {
      setLoading(true); // Optional: add loading state for UX
  
      let finalLogoUrl = formData.logo;
  
      // Handle new image upload
      if (logoFile) {
        // Delete old image if editing
        if (editing && formData.logo?.includes('firebasestorage.googleapis.com')) {
          await deleteFileFromStorage(formData.logo);
        }
        finalLogoUrl = await uploadImageToBackend(logoFile);
      }
  
      const data = {
        ...formData,
        logo: finalLogoUrl, // ✅ Use the resolved URL
        order: Number(formData.order) || 0,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.email
      };
  
      if (editing) {
        await updateDoc(doc(db, 'premiumNurseries', editing), data);
        alert('تم التحديث!');
      } else {
        await addDoc(collection(db, 'premiumNurseries'), {
          ...data,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.email
        });
        alert('تم الإضافة!');
      }
  
      resetForm();
      setLogoFile(null);
      setLogoPreview(null);
      fetchItems();
    } catch (err) {
      console.error('Error saving premium nursery:', err);
      alert('خطأ: ' + (err.message || 'فشل في الحفظ'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name || '',
      type: item.type || 'internal',
      nurseryId: item.nurseryId || '',
      externalUrl: item.externalUrl || '',
      logo: item.logo || '',
      description: item.description || '',
      order: item.order || 0,
      published: item.published !== false
    });
    setLogoPreview(item.logo || null);
    setLogoFile(null);
    setEditing(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد؟')) return;
    try {
      await deleteDoc(doc(db, 'premiumNurseries', id));
      alert('تم الحذف!');
      fetchItems();
    } catch (err) {
      alert('خطأ في الحذف: ' + err.message);
    }
  };

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-800">إدارة شركاء النجاح</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            + إضافة مشتل مميز
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div ref={formRef} className="bg-white p-8 rounded-2xl shadow-lg mb-8 border border-emerald-100">
            <h2 className="text-2xl font-bold mb-6">{editing ? 'تعديل مشتل مميز' : 'إضافة مشتل مميز'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">النوع</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="internal">داخلي (من الموقع)</option>
                    <option value="external">خارجي (رابط خارجي)</option>
                  </select>
                </div>

                {/* Dynamic Field: Nursery Dropdown OR Name + URL */}
                {formData.type === 'internal' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختيار المشتل من القائمة *
                    </label>
                    <select
                      name="nurseryId"
                      value={formData.nurseryId || ''}
                      onChange={(e) => {
                        const nurseryId = e.target.value;
                        // Update nurseryId first
                        setFormData(prev => ({ ...prev, nurseryId }));
                        // Auto-fill name, logo, description
                        if (nurseryId) {
                          const nursery = allNurseries.find(n => n.id === nurseryId);
                          if (nursery) {
                            setFormData(prev => ({
                              ...prev,
                              name: nursery.name || '',
                              logo: nursery.image || '',
                              description: nursery.description || ''
                            }));
                            setLogoPreview(nursery.image || null);
                          }
                        } else {
                          // Clear fields if "اختر مشتلًا" is selected
                          setFormData(prev => ({
                            ...prev,
                            name: '',
                            logo: '',
                            description: ''
                          }));
                          setLogoPreview(null);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">اختر مشتلًا</option>
                      {allNurseries.map((nursery) => (
                        <option key={nursery.id} value={nursery.id}>
                          {nursery.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">اسم المشتل الخارجي *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="مثل: مشاتل الخليج"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">رابط خارجي</label>
                      <input
                        type="url"
                        name="externalUrl"
                        value={formData.externalUrl}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </>
                )}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الشعار أو الصورة *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-400 transition">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="logo-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500">
                        <span>رفع صورة</span>
                        <input
                          id="logo-upload"
                          name="logo-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setLogoFile(file);
                              setLogoPreview(URL.createObjectURL(file));
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
                {(logoPreview || formData.logo) && (
                  <div className="mt-4 flex flex-col items-center">
                    <img
                      src={logoPreview || formData.logo}
                      alt="معاينة الشعار"
                      className="w-24 h-24 object-contain rounded-lg border mb-2 bg-gray-50"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/100x100/10b981/ffffff?text=Logo';
                      }}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (formData.logo && formData.logo.includes('firebasestorage.googleapis.com')) {
                          await deleteFileFromStorage(formData.logo);
                        }
                        setLogoFile(null);
                        setLogoPreview(null);
                        setFormData(prev => ({ ...prev, logo: '' }));
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 mt-2"
                    >
                      🗑️ حذف الصورة
                    </button>
                  </div>
                )}
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الترتيب</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">وصف (اختياري)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-emerald-600"
                  />
                  <span className="text-sm">منشور</span>
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition"
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

        {/* List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-emerald-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">شركاء النجاح ({items.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <p className="p-8 text-center text-gray-500">لا توجد مشاتل مميزة.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="w-16 h-16 object-contain rounded-lg"
                      onError={(e) => e.target.src = 'https://placehold.co/100x100/10b981/ffffff?text=No+Image'}
                    />
                    <div>
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description || '-'}</p>
                      <div className="text-sm text-emerald-600 mt-1">
                        النوع: {item.type === 'internal' ? 'داخلي' : 'خارجي'}
                      </div>
                      {item.type === 'external' && item.externalUrl && (
                        <a
                          href={item.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 underline"
                        >
                          {item.externalUrl}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                    {item.published ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">منشور</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">غير منشور</span>
                    )}
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm px-3 py-1 rounded transition"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-800 text-sm px-3 py-1 rounded transition"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumNurseriesManager;