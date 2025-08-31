import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const OffersManager = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    endDate: '',
    discount: null,
    highlighted: false
  });

  // Fetch offers
  const fetchOffers = async () => {
    const snapshot = await getDocs(collection(db, 'offers'));
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setOffers(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagChange = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tags: [],
      endDate: '',
      discount: null,
      highlighted: false
    });
    setEditing(null);
    setShowForm(false);
  };

  // Add or Update Offer
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.endDate) {
      alert('العنوان، الوصف، وتاريخ الانتهاء مطلوبون');
      return;
    }

    try {
      const trimmedData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        discount: formData.discount ? Number(formData.discount) : null
      };

      if (editing) {
        await updateDoc(doc(db, 'offers', editing), trimmedData);
        alert('تم تحديث العرض!');
      } else {
        await addDoc(collection(db, 'offers'), trimmedData);
        alert('تم إضافة العرض!');
      }

      resetForm();
      fetchOffers();
    } catch (err) {
      alert('خطأ في الحفظ: ' + err.message);
    }
  };

  // Delete Offer
  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;
    try {
      await deleteDoc(doc(db, 'offers', id));
      alert('تم الحذف!');
      fetchOffers();
    } catch (err) {
      alert('خطأ في الحذف: ' + err.message);
    }
  };

  // Edit Offer
  const handleEdit = (offer) => {
    setFormData({
      title: offer.title,
      description: offer.description,
      tags: offer.tags || [],
      endDate: offer.endDate,
      discount: offer.discount,
      highlighted: offer.highlighted || false
    });
    setEditing(offer.id);
    setShowForm(true);
  };

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-800">إدارة العروض</h1>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            + إضافة عرض جديد
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 border border-orange-100">
            <h2 className="text-2xl font-bold mb-6">{editing ? 'تعديل عرض' : 'إضافة عرض جديد'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عنوان العرض</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="خصم 30% على النباتات الداخلية"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الانتهاء</label>
                  <input
                    type="text"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="31 ديسمبر 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الخصم (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount || ''}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="مثل: 30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">مميز؟</label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      name="highlighted"
                      checked={formData.highlighted}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-orange-600"
                    />
                    <span className="text-sm">يظهر في العروض المميزة</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="احصل على خصم مميز على تشكيلة واسعة من النباتات الداخلية الجميلة..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التصنيفات</label>
                <div className="flex flex-wrap gap-2">
                  {['نباتات داخلية', 'توصيل', 'استشارات', 'أدوات زراعة', 'موسمي'].map((tag) => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag)}
                        onChange={() => handleTagChange(tag)}
                        className="mr-2 h-4 w-4 text-orange-600"
                      />
                      <span className="text-sm">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  {editing ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Offers List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">العروض ({offers.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {offers.length === 0 ? (
              <p className="p-8 text-center text-gray-500">لا توجد عروض.</p>
            ) : (
              offers.map((offer) => (
                <div key={offer.id} className="p-6 hover:bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-800">{offer.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{offer.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {offer.tags.map(tag => (
                        <span key={tag} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                    {offer.highlighted && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">مميز</span>
                    )}
                    <button
                      onClick={() => handleEdit(offer)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm px-3 py-1 rounded transition"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
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

export default OffersManager;