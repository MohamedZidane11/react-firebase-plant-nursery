// src/pages/SponsorsManager.jsx
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { db, auth } from '../firebase/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

const SponsorsManager = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const formRef = useRef();

  const API_BASE = 'https://nurseries.qvtest.com';

  const [formData, setFormData] = useState({
    name: '',
    blurb: '',
    logo: '',
    url: '',
    order: 0,
    published: true
  });

  // Auto-scroll to form when editing
  useLayoutEffect(() => {
    if (showForm && formRef.current && editing) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm, editing]);

  // Fetch sponsors
  const fetchSponsors = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'sponsors'));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => a.order - b.order);
      setSponsors(list);
    } catch (err) {
      console.error('Error fetching sponsors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
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
      blurb: '',
      logo: '',
      url: '',
      order: sponsors.length,
      published: true
    });
    setEditing(null);
    setShowForm(false);
    setLogoFile(null);
    setLogoPreview(null);
  };

  // Delete image from storage
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

  // Upload image to Firebase via backend
  const uploadImageToBackend = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'sponsors_images');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('اسم الراعي مطلوب');
      return;
    }
    if (!logoFile && !formData.logo?.trim()) {
      alert('الرجاء رفع شعار');
      return;
    }

    try {
      setLoading(true);

      let finalLogoUrl = formData.logo;

      if (logoFile) {
        // Delete old image if editing
        if (editing && formData.logo?.includes('firebasestorage.googleapis.com')) {
          await deleteFileFromStorage(formData.logo);
        }
        finalLogoUrl = await uploadImageToBackend(logoFile);
      }

      const data = {
        ...formData,
        logo: finalLogoUrl,
        order: Number(formData.order),
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.email
      };

      if (editing) {
        await updateDoc(doc(db, 'sponsors', editing), data);
        alert('تم تحديث الراعي!');
      } else {
        await addDoc(collection(db, 'sponsors'), {
          ...data,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.email
        });
        alert('تم إضافة الراعي!');
      }

      resetForm();
      fetchSponsors();
    } catch (err) {
      alert('خطأ في الحفظ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الراعي؟')) return;
    try {
      await deleteDoc(doc(db, 'sponsors', id));
      alert('تم الحذف!');
      fetchSponsors();
    } catch (err) {
      alert('خطأ في الحذف: ' + err.message);
    }
  };

  const handleEdit = (sponsor) => {
    setFormData({
      name: sponsor.name || '',
      blurb: sponsor.blurb || '',
      logo: sponsor.logo || '',
      url: sponsor.url || '',
      order: sponsor.order || 0,
      published: sponsor.published !== false
    });
    setLogoPreview(sponsor.logo || null);
    setLogoFile(null);
    setEditing(sponsor.id);
    setShowForm(true);
  };

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-800">إدارة الرعاة</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            + إضافة راعٍ جديد
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div ref={formRef} className="bg-white p-8 rounded-2xl shadow-lg mb-8 border border-yellow-100">
            <h2 className="text-2xl font-bold mb-6">{editing ? 'تعديل راعٍ' : 'إضافة راعٍ جديد'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم الراعي *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    placeholder="مثل: مشاتل الرياض الخضراء"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الرابط</label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    placeholder="https://sponsor.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الترتيب</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    placeholder="1, 2, 3..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">وصف قصير</label>
                <textarea
                  name="blurb"
                  value={formData.blurb}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="نباتات داخلية وخارجية مميزة"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الشعار *</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 transition">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="logo-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500">
                        <span>رفع شعار</span>
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
                        e.target.src = 'https://placehold.co/100x100/fbbf24/ffffff?text=Logo';
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
                      🗑️ حذف الشعار
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-yellow-600"
                  />
                  <span className="text-sm">منشور</span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
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

        {/* Sponsors List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-yellow-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">الرعاة ({sponsors.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {sponsors.length === 0 ? (
              <p className="p-8 text-center text-gray-500">لا توجد رعاة.</p>
            ) : (
              sponsors.map((sponsor) => (
                <div key={sponsor.id} className="p-6 hover:bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="w-16 h-16 object-contain rounded-lg"
                      onError={(e) => e.target.src = 'https://placehold.co/100x100/fbbf24/ffffff?text=No+Logo'}
                    />
                    <div>
                      <h3 className="font-bold text-gray-800">{sponsor.name}</h3>
                      <p className="text-sm text-gray-600">{sponsor.blurb}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                    {sponsor.published !== false ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        منشور
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        غير منشور
                      </span>
                    )}
                    <button
                      onClick={() => handleEdit(sponsor)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm px-3 py-1 rounded transition"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(sponsor.id)}
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

export default SponsorsManager;