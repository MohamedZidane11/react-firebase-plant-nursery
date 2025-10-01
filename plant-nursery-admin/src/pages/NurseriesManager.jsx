// src/pages/NurseriesManager.jsx
import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const NurseriesManager = () => {
  const [nurseries, setNurseries] = useState([]);
  const [offers, setOffers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    name: '',
    activity: '',
    mainCategory: '',
    subCategory: '',
    region: '',
    city: '',
    district: ''
  });

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const fetchOffers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'offers'));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOffers(list);
    } catch (err) {
      console.error('Error fetching offers:', err);
    }
  };

  const fetchNurseries = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'nurseries'));
      const list = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.featured || 0) - (a.featured || 0));
      setNurseries(list);
    } catch (err) {
      console.error('Error fetching nurseries:', err);
    }
  };

  const fetchLocations = async () => {
    try {
      const locDoc = await getDocs(collection(db, 'locations'));
      const doc = locDoc.docs.find(d => d.id === 'SA');
      if (doc) {
        setLocations(doc.data().data || []);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchNurseries(), fetchOffers(), fetchLocations()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشتل؟')) return;
    try {
      await deleteDoc(doc(db, 'nurseries', id));
      alert('تم الحذف بنجاح!');
      fetchNurseries();
    } catch (err) {
      alert('خطأ في الحذف: ' + err.message);
      console.error('Delete error:', err);
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

  const allCategories = useMemo(() => {
    const cats = new Set();
    nurseries.forEach(n => (n.categories || []).forEach(cat => cats.add(cat)));
    return Array.from(cats).sort();
  }, [nurseries]);

  const mainCategories = ['مشاتل', 'مشاتل مختلطة', 'أدوات الزراعة'];
  const subCategories = allCategories.filter(cat => !mainCategories.includes(cat));

  const filteredNurseries = useMemo(() => {
    let result = [...nurseries];

    if (filters.name.trim()) {
      const term = filters.name.trim().toLowerCase();
      result = result.filter(n => n.name.toLowerCase().includes(term));
    }

    if (filters.activity) {
      const isActive = filters.activity === 'active';
      result = result.filter(n => (n.published !== false) === isActive);
    }

    if (filters.mainCategory) {
      result = result.filter(n => (n.categories || []).includes(filters.mainCategory));
    }

    if (filters.subCategory) {
      result = result.filter(n => (n.categories || []).includes(filters.subCategory));
    }

    if (filters.region) {
      result = result.filter(n => n.region === filters.region);
    }

    if (filters.city) {
      result = result.filter(n => n.city === filters.city);
    }

    if (filters.district) {
      result = result.filter(n => n.district === filters.district);
    }

    // Apply sorting only during search
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (sortConfig.key === 'name') {
          const nameA = a.name || '';
          const nameB = b.name || '';
          if (nameA < nameB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (nameA > nameB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        } else if (sortConfig.key === 'active') {
          const aActive = a.published !== false ? 1 : 0;
          const bActive = b.published !== false ? 1 : 0;
          if (aActive < bActive) return sortConfig.direction === 'asc' ? 1 : -1;
          if (aActive > bActive) return sortConfig.direction === 'asc' ? -1 : 1;
          return 0;
        }
        return 0;
      });
    }

    return result;
  }, [nurseries, filters, sortConfig]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));

    if (name === 'region') {
      setFilters(prev => ({ ...prev, city: '', district: '' }));
    } else if (name === 'city') {
      setFilters(prev => ({ ...prev, district: '' }));
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const cities = useMemo(() => {
    if (!filters.region) return [];
    const region = locations.find(r => r.region === filters.region);
    return region ? region.cities.map(c => c.name) : [];
  }, [filters.region, locations]);

  const districts = useMemo(() => {
    if (!filters.region || !filters.city) return [];
    const region = locations.find(r => r.region === filters.region);
    if (!region) return [];
    const city = region.cities.find(c => c.name === filters.city);
    return city ? city.districts : [];
  }, [filters.region, filters.city, locations]);

  const isSearching = Object.values(filters).some(val => val !== '');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <p className="text-xl text-green-700">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-800">إدارة المشاتل</h1>
          <button
            onClick={() => navigate('/nurseries/add')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md"
          >
            + إضافة مشتل جديد
          </button>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">بحث عن مشتل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المشتل</label>
              <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="ابحث بالاسم..."
              />
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف الرئيسي</label>
              <select
                name="mainCategory"
                value={filters.mainCategory}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">الكل</option>
                {mainCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف الفرعي</label>
              <select
                name="subCategory"
                value={filters.subCategory}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">الكل</option>
                {subCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
              <select
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">اختر المنطقة</option>
                {locations.map(loc => (
                  <option key={loc.region} value={loc.region}>{loc.region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
              <select
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                disabled={!filters.region}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">اختر المدينة</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحي</label>
              <select
                name="district"
                value={filters.district}
                onChange={handleFilterChange}
                disabled={!filters.city}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">اختر الحي</option>
                {districts.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  name: '',
                  activity: '',
                  mainCategory: '',
                  subCategory: '',
                  region: '',
                  city: '',
                  district: ''
                })}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-md"
              >
                إعادة الضبط
              </button>
            </div>
          </div>
        </div>

        {/* Conditional Rendering */}
        {isSearching ? (
          /* 📊 TABLE VIEW with Sorting */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-green-100">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">نتائج البحث ({filteredNurseries.length})</h2>
            </div>

            {filteredNurseries.length === 0 ? (
              <p className="p-8 text-center text-gray-500">لا توجد نتائج مطابقة</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort('name')}
                      >
                        اسم المشتل
                        {sortConfig.key === 'name' && (
                          <span className="mr-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التصنيف الرئيسي</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموقع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الجوال</th>
                      <th 
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort('active')}
                      >
                        الحالة
                        {sortConfig.key === 'active' && (
                          <span className="mr-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العروض</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNurseries.map((nursery) => {
                      const discount = getNurseryDiscount(nursery.id);
                      const mainCat = (nursery.categories || []).find(cat => mainCategories.includes(cat)) || '-';
                      const fullLocation = `${nursery.region || ''} - ${nursery.city || ''} - ${nursery.district || ''}`.replace(/ - $/g, '').trim();
                      const phones = Array.isArray(nursery.phones) ? nursery.phones[0] : nursery.phone || '-';

                      return (
                        <tr key={nursery.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{nursery.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mainCat}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fullLocation}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{phones}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              nursery.published !== false 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {nursery.published !== false ? 'نشط' : 'غير نشط'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {discount !== null ? <span className="text-orange-500">خصم {discount}%</span> : 'لا يوجد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => navigate(`/nurseries/edit/${nursery.id}`)}
                              className="text-blue-600 hover:text-blue-900 ml-3"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => handleDelete(nursery.id)}
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
          /* 🗂️ CARD VIEW (original) */
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
                      <div className="flex items-center gap-4">
                        <img
                          src={nursery.image}
                          alt={nursery.name}
                          className="w-16 h-16 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/100x100/d1f7c4/4ade80?text=No+Image';
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
        )}
      </div>
    </div>
  );
};

export default NurseriesManager;