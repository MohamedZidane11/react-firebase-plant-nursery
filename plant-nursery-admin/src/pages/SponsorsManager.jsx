import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

const SponsorsManager = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const formRef = useRef();

  const [formData, setFormData] = useState({
    name: '',
    tier: 'gold', // gold, silver, bronze
    blurb: '',
    logo: '',
    url: '',
    order: 0,
    published: true
  });

  const tiers = { gold: 'ذهبي', silver: 'فضي', platinum: 'بلاتيني' };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'top' });
  };

  const fetchSponsors = async () => {
    const snapshot = await getDocs(collection(db, 'sponsors'));
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.order - b.order);
    setSponsors(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchSponsors();
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
      name: '',
      tier: 'gold',
      blurb: '',
      logo: '',
      url: '',
      order: 0,
      published: true
    });
    setEditing(null);
    setShowForm(false);
  };

  const saveSponsor = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.logo) {
      alert('الاسم والشعار مطلوبان');
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
        await updateDoc(doc(db, 'sponsors', editing), data);
      } else {
        await addDoc(collection(db, 'sponsors'), {
          ...data,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.email
        });
      }

      alert(`تم ${editing ? 'تحديث' : 'إضافة'} الراعي!`);
      resetForm();
      fetchSponsors();
    } catch (err) {
      alert('خطأ: ' + err.message);
    }
  };

  const deleteSponsor = async (id) => {
    if (confirm('حذف هذا الراعي؟')) {
      await deleteDoc(doc(db, 'sponsors', id));
      fetchSponsors();
    }
  };

  const handleEdit = (s) => {
    setFormData({
      name: s.name,
      tier: s.tier || 'gold',
      blurb: s.blurb || '',
      logo: s.logo,
      url: s.url || '',
      order: s.order || 0,
      published: s.published !== false
    });
    setEditing(s.id);
    setShowForm(true);
  };

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة الرعاة</h1>
          <button onClick={resetForm} className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium">
            + راعٍ جديد
          </button>
        </div>

        {showForm && (
          <div ref={formRef} className="bg-gray-800 p-8 rounded-2xl mb-8 border border-yellow-500">
            <h2 className="text-2xl font-bold mb-6">{editing ? 'تعديل راعٍ' : 'إضافة راعٍ جديد'}</h2>
            <form onSubmit={saveSponsor} className="space-y-6">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="اسم الراعي"
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white"
              />
              <select
                name="tier"
                value={formData.tier}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white"
              >
                <option value="platinum">بلاتيني</option>
                <option value="gold">ذهبي</option>
                <option value="silver">فضي</option>
              </select>
              <textarea
                name="blurb"
                value={formData.blurb}
                onChange={handleChange}
                placeholder="وصف قصير"
                rows="2"
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white"
              />
              <input
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                placeholder="رابط شعار الراعي"
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white"
              />
              <input
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="رابط الموقع"
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white"
              />
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                placeholder="الترتيب"
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white"
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
                <button type="submit" className="bg-yellow-500 text-black px-6 py-3 rounded-lg">حفظ</button>
                <button type="button" onClick={resetForm} className="bg-gray-600 text-white px-6 py-3 rounded-lg">إلغاء</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {sponsors.map(s => (
            <div key={s.id} className="bg-gray-800 p-6 rounded-lg border border-yellow-500 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src={s.logo} alt={s.name} className="w-12 h-12 rounded-full" />
                <div>
                  <strong>{s.name}</strong>
                  <p className="text-yellow-400 text-sm">{tiers[s.tier] || s.tier}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(s)} className="bg-yellow-500 text-black px-3 py-1 rounded">تعديل</button>
                <button onClick={() => deleteSponsor(s.id)} className="bg-red-800 text-white px-3 py-1 rounded">حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SponsorsManager;