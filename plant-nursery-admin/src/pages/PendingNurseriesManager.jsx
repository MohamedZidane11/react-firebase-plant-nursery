// src/pages/PendingNurseriesManager.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import defaultPending from '../assets/pending.png'; // ✅ Import default image

const PendingNurseriesManager = () => {
  const [nurseries, setNurseries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNurseries = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'pendingNurseries'));
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setNurseries(list);
    } catch (err) {
      console.error('Error fetching pending nurseries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNurseries();
  }, []);

  const approveNursery = async (id) => {
    const nursery = nurseries.find(n => n.id === id);
    if (!nursery) return;

    try {
      // Add to main nurseries collection
      await db.collection('nurseries').add({
        name: nursery.name,
        image: nursery.image,
        categories: nursery.categories || [],
        location: nursery.location,
        services: nursery.services || [],
        featured: !!nursery.featured,
        contactName: nursery.contactName,
        whatsapp: nursery.whatsapp,
        published: true,
        createdAt: new Date().toISOString()
      });

      // Mark as approved in pending collection
      await updateDoc(doc(db, 'pendingNurseries', id), {
        status: 'approved'
      });

      // Remove from UI
      setNurseries(prev => prev.filter(n => n.id !== id));
      alert('تمت الموافقة على المشتل!');
    } catch (err) {
      console.error('Error approving nursery:', err);
      alert('خطأ في الموافقة على المشتل');
    }
  };

  const rejectNursery = async (id) => {
    if (!confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    try {
      await deleteDoc(doc(db, 'pendingNurseries', id));
      setNurseries(prev => prev.filter(n => n.id !== id));
      alert('تم رفض الطلب');
    } catch (err) {
      console.error('Error rejecting nursery:', err);
      alert('خطأ في الرفض');
    }
  };

  if (loading) {
    return <p className="text-center py-8">جاري التحميل...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">مراجعة المشاتل الجديدة</h1>

        {nurseries.length === 0 ? (
          <p className="text-center text-gray-500">لا توجد مشاتل معلقة للمراجعة.</p>
        ) : (
          <div className="space-y-6">
            {nurseries.map(nursery => (
              <div key={nursery.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                {/* Nursery Info */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image */}
                  <div className="md:w-30 flex-shrink-0">
                    <img
                      src={nursery.image || defaultPending}
                      alt={nursery.name}
                      className="h-26 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = defaultPending;
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{nursery.name}</h3>
                    <p className="text-gray-600 mt-1"><strong>الموقع:</strong> {nursery.location}</p>
                    <p className="text-gray-600"><strong>المسئول:</strong> {nursery.contactName}</p>
                    <p className="text-gray-600"><strong>الواتس آب:</strong> {nursery.whatsapp}</p>

                    {/* Categories */}
                    <div className="mt-3">
                      <strong className="text-gray-700">التصنيفات:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {nursery.categories.length > 0 ? (
                          nursery.categories.map((cat, i) => (
                            <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {cat}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">لا يوجد</span>
                        )}
                      </div>
                    </div>

                    {/* Services */}
                    <div className="mt-3">
                      <strong className="text-gray-700">الخدمات:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {nursery.services.length > 0 ? (
                          nursery.services.map((svc, i) => {
                            const labelMap = {
                              delivery: 'التوصيل',
                              consultation: 'الاستشارات',
                              maintenance: 'الصيانة',
                              installation: 'التركيب'
                            };
                            return (
                              <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {labelMap[svc] || svc}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-500 text-sm">لا يوجد</span>
                        )}
                      </div>
                    </div>

                    {/* Featured */}
                    <div className="mt-3">
                      <strong className="text-gray-700">مميز:</strong>
                      <span className={`ml-2 text-sm font-medium ${nursery.featured ? 'text-green-600' : 'text-red-600'}`}>
                        {nursery.featured ? 'نعم' : 'لا'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-4 space-x-reverse">
                  <button
                    onClick={() => approveNursery(nursery.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    ✅ موافقة
                  </button>
                  <button
                    onClick={() => rejectNursery(nursery.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    ❌ رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingNurseriesManager;