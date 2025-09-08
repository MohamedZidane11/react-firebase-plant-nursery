// src/pages/PendingNurseriesManager.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

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
        ...nursery,
        published: true,
        approvedAt: new Date().toISOString()
      });

      // Update status
      await updateDoc(doc(db, 'pendingNurseries', id), {
        status: 'approved'
      });

      // Remove from UI
      setNurseries(prev => prev.filter(n => n.id !== id));
      alert('تمت الموافقة على المشتل!');
    } catch (err) {
      alert('خطأ في الموافقة');
    }
  };

  const rejectNursery = async (id) => {
    if (!confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    try {
      await deleteDoc(doc(db, 'pendingNurseries', id));
      setNurseries(prev => prev.filter(n => n.id !== id));
      alert('تم رفض الطلب');
    } catch (err) {
      alert('خطأ في الرفض');
    }
  };

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">مراجعة المشاتل الجديدة</h1>

        {nurseries.length === 0 ? (
          <p className="text-center text-gray-500">لا توجد مشاتل معلقة للمراجعة.</p>
        ) : (
          <div className="space-y-6">
            {nurseries.map(nursery => (
              <div key={nursery.id} className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-gray-800">{nursery.name}</h3>
                <p className="text-gray-600">{nursery.location}</p>
                <p><strong>المسئول:</strong> {nursery.contactName}</p>
                <p><strong>الواتس آب:</strong> {nursery.whatsapp}</p>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => approveNursery(nursery.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    ✅ موافقة
                  </button>
                  <button
                    onClick={() => rejectNursery(nursery.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
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