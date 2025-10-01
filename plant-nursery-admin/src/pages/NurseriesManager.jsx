// src/pages/NurseriesManager.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// import { uploadLocationsToFirestore } from '../utils/uploadLocations'; for uploading locations only

const NurseriesManager = () => {
  const [nurseries, setNurseries] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch offers
  const fetchOffers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'offers'));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOffers(list);
    } catch (err) {
      console.error('Error fetching offers:', err);
    }
  };

  // Fetch nurseries
  const fetchNurseries = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'nurseries'));
      const list = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => (b.featured || 0) - (a.featured || 0));
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

  // ✅ DELETE nursery
  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشتل؟')) return;
    try {
      await deleteDoc(doc(db, 'nurseries', id));
      alert('تم الحذف بنجاح!');
      fetchNurseries(); // Refresh list
    } catch (err) {
      alert('خطأ في الحذف: ' + err.message);
      console.error('Delete error:', err);
    }
  };

  // Helper: Check if offer is expired
  const isExpired = (endDateStr) => {
    if (!endDateStr) return false;
    const end = new Date(endDateStr);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return end < now;
  };

  // Helper: Get highest active discount for a nursery
  const getNurseryDiscount = (nurseryId) => {
    const activeOffers = offers.filter(
      (offer) =>
        offer.nurseryId === nurseryId &&
        offer.published !== false &&
        !isExpired(offer.endDate) &&
        offer.discount > 0
    );
    return activeOffers.length > 0
      ? Math.max(...activeOffers.map((o) => o.discount))
      : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <p className="text-xl text-green-700">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">إدارة المشاتل</h1>
          <button
            onClick={() => navigate('/nurseries/add')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md"
          >
            + إضافة مشتل جديد
          </button>
        </div>

       {/* for uploading locations only as json file */}
       {/* // Add this button near the top (only for admin use, remove later!)
        <button
          onClick={uploadLocationsToFirestore}
          className="bg-purple-600 text-white px-4 py-2 rounded mb-4"
        >
          🚀 رفع بيانات المواقع (مرة واحدة فقط)
        </button>*/}

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
                const discount = getNurseryDiscount(nursery.id);
                const fullLocation = `${nursery.region || ''} - ${nursery.city || ''} - ${nursery.district || ''}`.replace(/ - $/g, '').trim();

                return (
                  <div
                    key={nursery.id}
                    className="p-6 hover:bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Nursery Info */}
                    <div className="flex items-center gap-4">
                      <img
                        src={nursery.image}
                        alt={nursery.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.src =
                            'https://placehold.co/100x100/d1f7c4/4ade80?text=No+Image';
                        }}
                      />
                      <div>
                        <h3 className="font-bold text-gray-800">{nursery.name}</h3>
                        <p className="text-sm text-gray-600">{fullLocation}</p>
                        {discount !== null && (
                          <span className="text-orange-500 text-sm font-medium">
                            خصم {discount}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                      {nursery.featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          مميز
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          nursery.published !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {nursery.published !== false ? 'منشور' : 'غير منشور'}
                      </span>
                      <button
                        onClick={() => navigate(`/nurseries/edit/${nursery.id}`)}
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