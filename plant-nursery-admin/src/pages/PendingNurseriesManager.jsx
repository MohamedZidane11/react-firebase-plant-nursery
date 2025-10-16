// src/pages/PendingNurseriesManager.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';

const PendingNurseriesManager = () => {
  const [nurseries, setNurseries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNursery, setSelectedNursery] = useState(null);

  const fetchNurseries = async () => {
    try {
      const q = query(collection(db, 'pendingNurseries'), orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach((doc) => {
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
    const nursery = nurseries.find((n) => n.id === id);
    if (!nursery) return;

    try {
      const fullLocation = nursery.location || `${nursery.region} - ${nursery.city}${nursery.district ? ` - ${nursery.district}` : ''}`;

      const nurseryRef = await db.collection('nurseries').add({
        name: nursery.name,
        categories: nursery.categories || [],
        region: nursery.region || '',
        city: nursery.city || '',
        district: nursery.district || '',
        location: fullLocation,
        services: nursery.services || [],
        featured: !!nursery.featured,
        contactName: nursery.contactName,
        whatsapp: nursery.whatsapp,
        googleMapsLink: nursery.googleMapsLink || '',
        published: true,
        createdAt: new Date().toISOString(),
      });

      await updateDoc(doc(db, 'pendingNurseries', id), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedNurseryId: nurseryRef.id,
      });

      setNurseries((prev) => prev.filter((n) => n.id !== id));
      setSelectedNursery(null);
      alert('تمت الموافقة على المشتل!');
    } catch (err) {
      console.error('Error approving nursery:', err);
      alert('خطأ في الموافقة على المشتل');
    }
  };

  const rejectNursery = async (id) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    try {
      await deleteDoc(doc(db, 'pendingNurseries', id));
      setNurseries((prev) => prev.filter((n) => n.id !== id));
      setSelectedNursery(null);
      alert('تم رفض الطلب');
    } catch (err) {
      console.error('Error rejecting nursery:', err);
      alert('خطأ في الرفض');
    }
  };

  const getServiceLabel = (svc) => {
    const map = {
      delivery: 'التوصيل',
      consultation: 'الاستشارات',
      maintenance: 'الصيانة',
      installation: 'التركيب',
    };
    return map[svc] || svc;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    // Gregorian format: Oct 16, 2025
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    // Or use: date.toISOString().split('T')[0] for YYYY-MM-DD
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-700">جاري تحميل الطلبات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">مراجعة طلبات تسجيل المشاتل</h1>

        {nurseries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow text-xl text-gray-600">
            لا توجد طلبات معلقة حاليًا.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-right text-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-800">اسم المشتل</th>
                    <th className="px-6 py-4 font-bold text-gray-800">اسم المسئول</th>
                    <th className="px-6 py-4 font-bold text-gray-800">المنطقة</th>
                    <th className="px-6 py-4 font-bold text-gray-800">تاريخ الإرسال</th>
                    <th className="px-6 py-4 font-bold text-gray-800">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {nurseries.map((nursery) => (
                    <tr key={nursery.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{nursery.name || '—'}</td>
                      <td className="px-6 py-4 text-gray-700">{nursery.contactName || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                          {nursery.region || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(nursery.submittedAt)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedNursery(nursery)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-base font-medium transition"
                        >
                          عرض التفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {selectedNursery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">تفاصيل الطلب</h2>
                  <button
                    onClick={() => setSelectedNursery(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    &times;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-3">المعلومات الأساسية</h3>
                    <p><span className="font-medium">اسم المشتل:</span> {selectedNursery.name}</p>
                    <p><span className="font-medium">اسم المسئول:</span> {selectedNursery.contactName}</p>
                    <p><span className="font-medium">واتس آب:</span> 
                      <a
                        href={`https://wa.me/${selectedNursery.whatsapp?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline mr-2"
                      >
                        {selectedNursery.whatsapp}
                      </a>
                    </p>
                    {selectedNursery.submittedAt && (
                      <p><span className="font-medium">تاريخ الإرسال:</span> {formatDate(selectedNursery.submittedAt)}</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-3">الموقع</h3>
                    <p><span className="font-medium">المنطقة:</span> {selectedNursery.region || '—'}</p>
                    <p><span className="font-medium">المدينة:</span> {selectedNursery.city || '—'}</p>
                    <p><span className="font-medium">الحي:</span> {selectedNursery.district || '—'}</p>
                    {selectedNursery.googleMapsLink && (
                      <div className="mt-2">
                        <span className="font-medium">رابط خرائط جوجل:</span>
                        <a
                          href={selectedNursery.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:underline break-all"
                        >
                          {selectedNursery.googleMapsLink}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">التصنيفات</h3>
                  {selectedNursery.categories?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedNursery.categories.map((cat, i) => (
                        <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-lg">
                          {cat}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-lg">لا يوجد</p>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">الخدمات</h3>
                  {selectedNursery.services?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedNursery.services.map((svc, i) => (
                        <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-lg">
                          {getServiceLabel(svc)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-lg">لا يوجد</p>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">مميز</h3>
                  <span className={`px-4 py-2 rounded-full font-bold text-lg ${
                    selectedNursery.featured
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedNursery.featured ? 'نعم' : 'لا'}
                  </span>
                </div>

                {/* Action Buttons in Modal */}
                <div className="flex justify-end space-x-4 space-x-reverse pt-4 border-t">
                  <button
                    onClick={() => approveNursery(selectedNursery.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-bold transition"
                  >
                    ✅ موافقة
                  </button>
                  <button
                    onClick={() => rejectNursery(selectedNursery.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-bold transition"
                  >
                    ❌ رفض
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingNurseriesManager;