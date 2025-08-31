import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const Dashboard = () => {
  const [stats, setStats] = useState({
    nurseries: { published: 0, unpublished: 0 },
    offers: { active: 0, expired: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Count nurseries
        const nurseriesSnap = await getDocs(collection(db, 'nurseries'));
        const nurseries = nurseriesSnap.docs.map(doc => doc.data());
        const published = nurseries.filter(n => n.published !== false).length;
        const unpublished = nurseries.filter(n => n.published === false).length;

        // Count offers (active vs expired)
        const offersSnap = await getDocs(collection(db, 'offers'));
        const offers = offersSnap.docs.map(doc => doc.data());
        const today = new Date();
        const active = offers.filter(offer => {
          const endDate = new Date(offer.endDate);
          return endDate >= today;
        }).length;
        const expired = offers.length - active;

        setStats({
          nurseries: { published, unpublished },
          offers: { active, expired }
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-center py-8">جاري التحميل...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-800 mb-2">لوحة التحكم</h1>
          <p className="text-gray-600">إدارة المشاتل والعروض</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          
          {/* Nurseries */}
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center border border-green-100">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">المشاتل</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600">{stats.nurseries.published}</div>
                <div className="text-sm text-gray-600 mt-1">منشور</div>
              </div>
              <div className="p-6 bg-red-50 rounded-xl">
                <div className="text-3xl font-bold text-red-600">{stats.nurseries.unpublished}</div>
                <div className="text-sm text-gray-600 mt-1">غير منشور</div>
              </div>
            </div>
          </div>

          {/* Offers */}
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center border border-orange-100">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">العروض</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-orange-50 rounded-xl">
                <div className="text-3xl font-bold text-orange-600">{stats.offers.active}</div>
                <div className="text-sm text-gray-600 mt-1">نشطة</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="text-3xl font-bold text-gray-600">{stats.offers.expired}</div>
                <div className="text-sm text-gray-600 mt-1">منتهية</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">الإجراءات السريعة</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium transition">
              إضافة مشتل جديد
            </button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-medium transition">
              إضافة عرض جديد
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;