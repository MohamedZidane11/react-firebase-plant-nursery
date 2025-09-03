// src/pages/CategoriesManager.jsx
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { db, auth } from '../firebase/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const formRef = useRef();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    ctaText: 'استكشاف',
    ctaUrl: '',
    order: 0,
    published: true
  });

  // Scroll to form when editing
  useLayoutEffect(() => {
    if (showForm && formRef.current && editing) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm, editing]);

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => a.order - b.order); // Sort by order
      setCategories(list);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
      title: '',
      description: '',
      image: '',
      ctaText: 'استكشاف',
      ctaUrl: '',
      order: categories.length, // Default to next order
      published: true
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image.trim()) {
      alert('العنوان والصورة مطلوبان');
      return;
    }

    try {
      const data = {
        ...formData,
        order: Number(formData.order),
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.email
      };

      if (editing) {
        await updateDoc(doc(db, 'categories', editing), data);
        alert('تم تحديث التصنيف!');
      } else {
        await addDoc(collection(db, 'categories'), {
          ...data,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.email
        });
        alert('تم إضافة التصنيف!');
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      alert('خطأ في الحفظ: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      alert('تم الحذف!');
      fetchCategories();
    } catch (err) {
      alert('خطأ في الحذف: ' + err.message);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      title: category.title,
      description: category.description || '',
      image: category.image,
      ctaText: category.ctaText || 'استكشاف',
      ctaUrl: category.ctaUrl || '',
      order: category.order || 0,
      published: category.published !== false
    });
    setEditing(category.id);
    setShowForm(true);
  };

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">إدارة التصنيفات</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            + إضافة تصنيف جديد
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div ref={formRef} className="bg-white p-8 rounded-2xl shadow-lg mb-8 border border-blue-100">
            <h2 className="text-2xl font-bold mb-6">{editing ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عنوان التصنيف</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثل: زهور، نخيل"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الصورة</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الترتيب</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثل: 1, 2, 3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نص الزر</label>
                  <input
                    type="text"
                    name="ctaText"
                    value={formData.ctaText}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثل: استكشاف، اكتشف المزيد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رابط الزر</label>
                  <input
                    type="url"
                    name="ctaUrl"
                    value={formData.ctaUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://nursery.com/category"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف (اختياري)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="وصف قصير للتصنيف"
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm">منشور</span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
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

        {/* Categories List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">التصنيفات ({categories.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {categories.length === 0 ? (
              <p className="p-8 text-center text-gray-500">لا توجد تصنيفات.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="p-6 hover:bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => e.target.src = 'https://placehold.co/100x100/3b82f6/ffffff?text=No+Image'}
                    />
                    <div>
                      <h3 className="font-bold text-gray-800">{cat.title}</h3>
                      {cat.description && (
                        <p className="text-sm text-gray-600 line-clamp-1">{cat.description}</p>
                      )}
                      <div className="text-sm text-blue-600 mt-1">الترتيب: {cat.order}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                    {cat.published !== false ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        منشور
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        غير منشور
                      </span>
                    )}
                    <button
                      onClick={() => handleEdit(cat)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm px-3 py-1 rounded transition"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
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

export default CategoriesManager;