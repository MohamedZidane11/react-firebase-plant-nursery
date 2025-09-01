import { useState, useEffect, useRef } from 'react';
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
    ctaText: '',
    ctaUrl: '',
    order: 0,
    published: true
  });

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'top' });
  };

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, 'categories'));
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.order - b.order);
    setCategories(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (showForm) setTimeout(scrollToForm, 100);
  }, [showForm]);

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
      ctaText: '',
      ctaUrl: '',
      order: 0,
      published: true
    });
    setEditing(null);
    setShowForm(false);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
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
        alert('تم التحديث!');
      } else {
        await addDoc(collection(db, 'categories'), {
          ...data,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.email
        });
        alert('تم الإضافة!');
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      alert('خطأ: ' + err.message);
    }
  };

  const deleteCategory = async (id) => {
    if (confirm('حذف هذا التصنيف؟')) {
      await deleteDoc(doc(db, 'categories', id));
      fetchCategories();
    }
  };

  const handleEdit = (cat) => {
    setFormData({
      title: cat.title,
      description: cat.description || '',
      image: cat.image,
      ctaText: cat.ctaText || '',
      ctaUrl: cat.ctaUrl || '',
      order: cat.order || 0,
      published: cat.published !== false
    });
    setEditing(cat.id);
    setShowForm(true);
  };

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">إدارة التصنيفات</h1>
          <button onClick={resetForm} className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium">
            + تصنيف جديد
          </button>
        </div>

        {showForm && (
          <div ref={formRef} className="bg-white p-8 rounded-2xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-6">{editing ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}</h2>
            <form onSubmit={saveCategory} className="space-y-6">
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="عنوان التصنيف"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="وصف التصنيف"
                rows="2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="رابط صورة التصنيف"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                name="ctaText"
                value={formData.ctaText}
                onChange={handleChange}
                placeholder="نص الزر (مثل: استكشاف)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                name="ctaUrl"
                value={formData.ctaUrl}
                onChange={handleChange}
                placeholder="رابط الزر"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                placeholder="الترتيب"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4"
                />
                <span>منشور</span>
              </label>
              <div className="flex gap-4">
                <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg">
                  {editing ? 'تحديث' : 'إضافة'}
                </button>
                <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-6 py-3 rounded-lg">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {categories.map(cat => (
            <div key={cat.id} className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src={cat.image} alt={cat.title} className="w-12 h-12 object-cover rounded-lg" />
                <div>
                  <strong>{cat.title}</strong>
                  <p className="text-sm text-gray-600">الترتيب: {cat.order}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(cat)} className="bg-blue-100 text-blue-800 px-3 py-1 rounded">تعديل</button>
                <button onClick={() => deleteCategory(cat.id)} className="bg-red-100 text-red-800 px-3 py-1 rounded">حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesManager;