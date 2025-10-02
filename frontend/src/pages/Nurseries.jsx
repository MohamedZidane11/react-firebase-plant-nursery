// src/pages/Nurseries.jsx
import { useState, useEffect } from 'react';
import NurseryCard from '../components/NurseryCard';

const Nurseries = () => {
  const [nurseries, setNurseries] = useState([]);
  const [offers, setOffers] = useState([]); // ✅ Add state for offers
  const [categories, setCategories] = useState([]); // ✅ Store fetched categories
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true); // Optional UX state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // 🔍 Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' or exact category title
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showOffersOnly, setShowOffersOnly] = useState(false);

  // 🌐 Fetch nurseries
  useEffect(() => {
    const fetchNurseries = async () => {
      try {
        const API_BASE = 'https://react-firebase-plant-nursery-production.up.railway.app';
        const response = await fetch(`${API_BASE}/api/nurseries`);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        setNurseries(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching nurseries:', err);
        alert('تعذر الاتصال بالخادم');
      }
    };

    fetchNurseries();
  }, []);

  // 🌐 Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const API_BASE = 'https://react-firebase-plant-nursery-production.up.railway.app';
        const response = await fetch(`${API_BASE}/api/offers`);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        // Filter only published offers
        const publishedOffers = Array.isArray(data) ? data.filter(offer => offer.published !== false) : [];
        setOffers(publishedOffers);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setOffers([]);
      }
    };

    fetchOffers();
  }, []);

  // 🌐 Fetch categories — to populate filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_BASE = 'https://react-firebase-plant-nursery-production.up.railway.app';
        const response = await fetch(`${API_BASE}/api/categories`);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Helper function to check if offer is expired
  const isExpired = (endDateStr) => {
    if (!endDateStr) return false;
    const end = new Date(endDateStr);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return end < now;
  };

  // Helper function to get active discount for a nursery
  const getActiveDiscount = (nurseryId) => {
    // Find active offers for this nursery
    const activeOffers = offers.filter(offer => 
      offer.nurseryId === nurseryId && 
      !isExpired(offer.endDate)
    );
    
    // Return the highest discount if multiple offers exist
    if (activeOffers.length > 0) {
      return Math.max(...activeOffers.map(offer => offer.discount || 0));
    }
    return null;
  };

  // 🌆 Build filter options (regions, cities, districts)
  const regions = [...new Set(nurseries.map(n => n.region).filter(Boolean))].sort();
  const cities = selectedRegion === 'all'
    ? [...new Set(nurseries.map(n => n.city).filter(Boolean))].sort()
    : [...new Set(nurseries.filter(n => n.region === selectedRegion).map(n => n.city))].sort();

  const districts = selectedCity === 'all'
    ? selectedRegion === 'all'
      ? [...new Set(nurseries.map(n => n.district).filter(Boolean))].sort()
      : [...new Set(nurseries.filter(n => n.region === selectedRegion).map(n => n.district))].sort()
    : [...new Set(nurseries.filter(n => n.city === selectedCity).map(n => n.district))].sort();

  // 🔎 Filter nurseries
  const filteredNurseries = nurseries.filter((nursery) => {
    const matchesSearch = searchTerm
      ? nursery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nursery.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nursery.categories.some(cat =>
          cat.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true;

    // ✅ Filter by exact category match (no grouping)
    const matchesCategory = selectedCategory === 'all'
      ? true
      : nursery.categories.includes(selectedCategory);

    const matchesRegion = selectedRegion === 'all' || nursery.region === selectedRegion;
    const matchesCity = selectedCity === 'all' || nursery.city === selectedCity;
    const matchesDistrict = selectedDistrict === 'all' || nursery.district === selectedDistrict;
    
    // Update: Check for active offers instead of nursery.discount
    const hasActiveOffer = getActiveDiscount(nursery.id) !== null;
    const matchesOffer = showOffersOnly ? hasActiveOffer : true;

    return matchesSearch && matchesCategory && matchesRegion && matchesCity && matchesDistrict && matchesOffer;
  });

  // 📊 Sort
  const sortedNurseries = [...filteredNurseries].sort((a, b) => {
    if (sortBy === 'newest') {
      // Use createdAt if available, fallback to id (less reliable)
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA; // Newest first
    }
    if (sortBy === 'popular') {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
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

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedRegion, selectedCity, selectedDistrict, showOffersOnly, sortBy]);

  // Set loading to false when both nurseries and offers are loaded
  useEffect(() => {
    if (nurseries.length > 0 || offers.length > 0) {
      setLoading(false);
    }
  }, [nurseries, offers]);

  if (loading) {
    return <p className="text-center py-8">جاري التحميل...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filters */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
            <div className="flex flex-wrap gap-4 items-center justify-center">
              {/* Search */}
              <input
                type="text"
                placeholder="ابحث عن مشتل، منطقة، أو تصنيف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />

              {/* ✅ Category Filter — Show ALL categories from API */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={loadingCategories}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                <option value="all">جميع التصنيفات</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.title}>
                    {cat.title}
                  </option>
                ))}
              </select>

              {/* Region Filter */}
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setSelectedCity('all');
                  setSelectedDistrict('all');
                }}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">جميع المناطق</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>

              {/* City Filter */}
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedDistrict('all');
                }}
                disabled={selectedRegion === 'all' && cities.length === 0}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                <option value="all">جميع المدن</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {/* District Filter */}
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={selectedCity === 'all' && districts.length === 0}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                <option value="all">جميع الأحياء</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Sort & Offers */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="newest">الترتيب حسب: الأحدث</option>
                <option value="popular">الأكثر شهرة</option>
              </select>

              <div className="flex items-center">
                <label className="mr-2 text-sm">عروض حالية فقط</label>
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

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">عُثر على {sortedNurseries.length} مشتل</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentNurseries.length > 0 ? (
              currentNurseries.map((nursery) => (
                <div className='hover:-translate-y-4 transition-transform duration-500 ease-in-out'>
                  <NurseryCard 
                    key={nursery.id} 
                    nursery={nursery} 
                    offers={offers} // Pass offers to NurseryCard
                  />
                </div>
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