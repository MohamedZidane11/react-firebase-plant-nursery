import { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

const FiltersManager = () => {
  const [filters, setFilters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ label: '', slug: '', order: 0, published: true });

  const fetch = async () => {
    const snapshot = await getDocs(collection(db, 'filters'));
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.order - b.order);
    setFilters(list);
  };

  useEffect(() => { fetch(); }, []);

  const reset = () => {
    setFormData({ label: '', slug: '', order: 0, published: true });
    setEditing(null);
    setShowForm(false);
  };

  const save = async () => {
    if (!formData.label || !formData.slug) return alert('الحقلين مطلوبان');

    const data = {
      ...formData,
      order: Number(formData.order),
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser.email
    };

    if (editing) {
      await updateDoc(doc(db, 'filters', editing), data);
    } else {
      await addDoc(collection(db, 'filters'), {
        ...data,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.email
      });
    }

    reset();
    fetch();
  };

  const del = async (id) => {
    if (confirm('حذف هذا الفلتر؟')) {
      await deleteDoc(doc(db, 'filters', id));
      fetch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة الفلاتر</h1>
          <button onClick={reset} className="bg-blue-600 text-white px-6 py-3 rounded-lg">+ فلتر جديد</button>
        </div>

        {showForm && (
          <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-6">{editing ? 'تعديل' : 'إضافة'} فلتر</h2>
            <div className="space-y-4">
              <input
                placeholder="الاسم"
                value={formData.label}
                onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                placeholder="الرابط (slug)"
                value={formData.slug}
                onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="الترتيب"
                value={formData.order}
                onChange={e => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={e => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                  className="mr-2"
                />
                <span>منشور</span>
              </label>
              <div className="flex gap-4">
                <button onClick={save} className="bg-green-600 text-white px-6 py-3 rounded-lg">حفظ</button>
                <button onClick={reset} className="bg-gray-500 text-white px-6 py-3 rounded-lg">إلغاء</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
          {filters.map(f => (
            <div key={f.id} className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <strong>{f.label}</strong> ({f.slug}) - الترتيب: {f.order}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setFormData(f); setEditing(f.id); setShowForm(true); }} className="bg-blue-100 text-blue-800 px-3 py-1 rounded">تعديل</button>
                <button onClick={() => del(f.id)} className="bg-red-100 text-red-800 px-3 py-1 rounded">حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FiltersManager;