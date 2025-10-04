// src/pages/OffersManager.jsx
import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const OffersManager = () => {
  const [offers, setOffers] = useState([]);
  const [nurseries, setNurseries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    displayName: '',
    nurseryId: '',
    activity: '' // 'active' or 'inactive'
  });

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const fetchOffers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'offers'));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      // Sort by createdAt: newest first
      list.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime; // descending = newest first
      });
  
      setOffers(list);
    } catch (err) {
      console.error('Error fetching offers:', err);
    }
  };

  const fetchNurseries = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'nurseries'));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      })).sort((a, b) => a.name.localeCompare(b.name));
      setNurseries(list);
    } catch (err) {
      console.error('Error fetching nurseries:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchOffers(), fetchNurseries()]);
      setLoading(false);
    };
    loadData();
  }, []);

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

  const isExpired = (endDateStr) => {
    if (!endDateStr) return false;
    const end = new Date(endDateStr);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return end < now;
  };

  const filteredOffers = useMemo(() => {
    let result = [...offers];

    if (filters.displayName.trim()) {
      const term = filters.displayName.trim().toLowerCase();
      result = result.filter(o => o.title.toLowerCase().includes(term));
    }

    if (filters.nurseryId) {
      result = result.filter(o => o.nurseryId === filters.nurseryId);
    }

    if (filters.activity) {
      const isActive = filters.activity === 'active';
      result = result.filter(o => {
        const active = !isExpired(o.endDate) && o.published !== false;
        return isActive ? active : !active;
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (sortConfig.key === 'title') {
          return sortConfig.direction === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        } else if (sortConfig.key === 'active') {
          const aActive = !isExpired(a.endDate) && a.published !== false ? 1 : 0;
          const bActive = !isExpired(b.endDate) && b.published !== false ? 1 : 0;
          return sortConfig.direction === 'asc'
            ? bActive - aActive
            : aActive - bActive;
        }
        return 0;
      });
    }

    return result;
  }, [offers, filters, sortConfig]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const isSearching = Object.values(filters).some(val => val !== '');

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-800">إدارة العروض</h1>
          <button
            onClick={() => navigate('/offers/add')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            + إضافة عرض جديد
          </button>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">بحث عن عرض</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم العرض</label>
              <input
                type="text"
                name="displayName"
                value={filters.displayName}
                onChange={handleFilterChange}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="ابحث بالاسم..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المشتل</label>
              <select
                name="nurseryId"
                value={filters.nurseryId}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">الكل</option>
                {nurseries.map(n => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">حالة النشاط</label>
              <select
                name="activity"
                value={filters.activity}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">الكل</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>
          </div>
        </div>

        {/* Conditional Rendering */}
        {isSearching ? (
          /* 📊 TABLE VIEW */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-100">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">نتائج البحث ({filteredOffers.length})</h2>
            </div>

            {filteredOffers.length === 0 ? (
              <p className="p-8 text-center text-gray-500">لا توجد نتائج مطابقة</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('title')}
                      >
                        اسم العرض
                        {sortConfig.key === 'title' && (
                          <span className="mr-1">{sortConfig.direction === 'asc' ? '↓' : '↑'}</span>
                        )}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المشتل</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOffers.map((offer) => {
                      const isActive = !isExpired(offer.endDate) && offer.published !== false;
                      return (
                        <tr key={offer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{offer.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {offer.nurseryName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isActive ? 'نشط' : 'غير نشط'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => navigate(`/offers/edit/${offer.id}`)}
                              className="text-blue-600 hover:text-blue-900 ml-3"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => handleDelete(offer.id)}
                              className="text-red-600 hover:text-red-900 mr-3"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* 🗂️ CARD VIEW */
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
                      <div className="flex items-center gap-4">
                        <img
                          src={offer.image || '/images/offer_default.png'}
                          alt={offer.title}
                          className="w-16 h-16 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.src = '/images/offer_default.png';
                          }}
                        />
                        <div>
                          <h3 className="font-bold text-gray-800">{offer.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{offer.description}</p>
                          {/* ... rest */}
                        </div>
                      </div>
                      {offer.nurseryName && (
                        <p className="text-sm text-green-600 mt-1">من: {offer.nurseryName}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {offer.highlighted && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            مميز
                          </span>
                        )}
                        {offer.published !== false ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            منشور
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            غير منشور
                          </span>
                        )}
                        {isExpired(offer.endDate) ? (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            منتهي
                          </span>
                        ) : (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            نشط
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                      <button
                        onClick={() => navigate(`/offers/edit/${offer.id}`)}
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
        )}
      </div>
    </div>
  );
};

export default OffersManager;