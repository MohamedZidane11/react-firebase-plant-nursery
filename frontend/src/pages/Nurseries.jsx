import { useState, useEffect } from 'react';
import NurseryCard from '../components/NurseryCard';
import SearchBar from '../components/SearchBar';
import { db } from '../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

const Nurseries = () => {
  const [nurseries, setNurseries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // 🔍 Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showOffersOnly, setShowOffersOnly] = useState(false);

  // 🌐 Fetch nurseries from Firebase
  useEffect(() => {
    const fetchNurseries = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'nurseries'));
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(n => n.published !== false); // Only show published
        setNurseries(list);
      } catch (err) {
        console.error('Error fetching nurseries from Firebase:', err);
        alert('تعذر تحميل المشاتل');
      } finally {
        setLoading(false);
      }
    };

    fetchNurseries();
  }, []);

  // 🌆 Extract cities & districts from fetched data
  const cityToDistricts = nurseries.reduce((acc, nursery) => {
    const parts = nursery.location.split('-').map(part => part.trim());
    const city = parts[0];
    const district = parts.length > 1 ? parts[1] : 'غير محدد';

    if (!acc[city]) acc[city] = new Set();
    acc[city].add(district);

    return acc;
  }, {});

  Object.keys(cityToDistricts).forEach(city => {
    cityToDistricts[city] = [...cityToDistricts[city]].sort();
  });

  const allCities = [...Object.keys(cityToDistricts)].sort();

  // 🔎 Filter nurseries
  const filteredNurseries = nurseries.filter((nursery) => {
    const parts = nursery.location.split('-').map(part => part.trim());
    const city = parts[0];
    const district = parts.length > 1 ? parts[1] : 'غير محدد';

    const matchesSearch = searchTerm
      ? nursery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nursery.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nursery.categories.some(cat =>
          cat.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true;

    const matchesCategory = selectedCategory === 'all' ? true : nursery.categories.some((cat) => {
      if (selectedCategory === 'nursery') return ['مشاتل', 'مشاتل مختلطة'].includes(cat);
      if (selectedCategory === 'tools') return ['معدات', 'أدوات الزراعة'].includes(cat);
      if (selectedCategory === 'plants') return ['زهور', 'نخيل', 'نباتات داخلية', 'نباتات خارجية'].includes(cat);
      return false;
    });

    const matchesCity = selectedRegion === 'all' || city === selectedRegion;
    const matchesDistrict = selectedDistrict === 'all' || selectedRegion === 'all' || district === selectedDistrict;
    const matchesOffer = showOffersOnly ? nursery.discount !== null : true;

    return matchesSearch && matchesCategory && matchesCity && matchesDistrict && matchesOffer;
  });

  // 📊 Sort
  const sortedNurseries = [...filteredNurseries].sort((a, b) => {
    if (sortBy === 'newest') return b.id - a.id;
    if (sortBy === 'popular') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    return 0;
  });

  // 🧮 Pagination
  const totalPages = Math.ceil(sortedNurseries.length / itemsPerPage);
  const currentNurseries = sortedNurseries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedRegion, selectedDistrict, showOffersOnly, sortBy]);

  if (loading) {
    return <p className="text-center py-8">جاري التحميل...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search and Filters */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              cityToDistricts={cityToDistricts}
              allCities={allCities}
              sortBy={sortBy}
              setSortBy={setSortBy}
              showOffersOnly={showOffersOnly}
              setShowOffersOnly={setShowOffersOnly}
            />

            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="newest">الترتيب حسب:</option>
                <option value="newest">الأحدث إضافة</option>
                <option value="popular">الأكثر شهرة</option>
                <option value="rating">التقييم</option>
              </select>

              <div className="flex items-center">
                <label className="mr-2 text-sm">إظهار المشاتل ذات العروض الحالية فقط</label>
                <input
                  type="checkbox"
                  checked={showOffersOnly}
                  onChange={(e) => setShowOffersOnly(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nurseries Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">عُثر على {sortedNurseries.length} مشتل</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentNurseries.length > 0 ? (
              currentNurseries.map((nursery) => (
                <NurseryCard key={nursery.id} nursery={nursery} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-8">
                لا توجد مشاتل مطابقة للبحث.
              </p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                السابق
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === i + 1
                      ? 'bg-green-500 text-white'
                      : 'border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Nurseries;