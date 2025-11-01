// src/pages/Nurseries.jsx
import { useState, useEffect } from 'react';
import NurseryCard from '../components/NurseryCard';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useSEO } from '../hooks/useSEO';
import SEO from '../components/SEO';

const Nurseries = () => {
  const [nurseries, setNurseries] = useState([]);
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // 🔍 Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showOffersOnly, setShowOffersOnly] = useState(false);
  const [saudiLocations, setSaudiLocations] = useState([]);
  const [allSaudiRegions, setAllSaudiRegions] = useState([]);

  const { seo } = useSEO('nurseries');

  // 🌐 Fetch nurseries
  useEffect(() => {
    const fetchNurseries = async () => {
      try {
        const API_BASE = 'https://nurseries.qvtest.com';
        const response = await fetch(`${API_BASE}/api/nurseries`);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        console.log('Fetched nurseries:', data);
        setNurseries(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching nurseries:', err);
        setNurseries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNurseries();
  }, []);

  // 🌐 Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const API_BASE = 'https://nurseries.qvtest.com';
        const response = await fetch(`${API_BASE}/api/offers`);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const publishedOffers = Array.isArray(data) ? data.filter(offer => offer.published !== false) : [];
        setOffers(publishedOffers);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setOffers([]);
      }
    };

    fetchOffers();
  }, []);

  // 🌐 Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_BASE = 'https://nurseries.qvtest.com';
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

  // 🌍 Fetch full Saudi regions from Firestore (like in NurseryForm)
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locDoc = await getDoc(doc(db, 'locations', 'SA'));
        if (locDoc.exists()) {
          const locData = locDoc.data().data || [];
          setSaudiLocations(locData); // ← full structure
          const allRegions = locData.map(loc => loc.region).sort();
          setAllSaudiRegions(allRegions);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };

    fetchLocations();
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
    const activeOffers = offers.filter(offer => 
      offer.nurseryId === nurseryId && 
      !isExpired(offer.endDate)
    );
    
    if (activeOffers.length > 0) {
      return Math.max(...activeOffers.map(offer => offer.discount || 0));
    }
    return null;
  };

  // Helper: Get the latest highlighted offer
  const latestHighlightedOffer = offers
  .filter(offer => offer.highlighted && !isExpired(offer.endDate))
  .sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return dateB - dateA; // newest first
  })[0];

  // 🌆 Build filter options (regions, cities, districts)
  const regions = [...new Set(nurseries.map(n => n.region).filter(Boolean))].sort();
  const cities = selectedRegion === 'all'
    ? []
    : saudiLocations
        .find(loc => loc.region === selectedRegion)
        ?.cities?.map(c => c.name)
        .sort() || [];

  const districts = selectedCity === 'all'
    ? []
    : saudiLocations
        .find(loc => loc.region === selectedRegion)
        ?.cities
        ?.find(c => c.name === selectedCity)
        ?.districts
        .sort() || [];

  // 🔎 Filter nurseries
  const filteredNurseries = nurseries.filter((nursery) => {
    const matchesSearch = searchTerm
      ? nursery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (nursery.location && nursery.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (Array.isArray(nursery.categories) && nursery.categories.some(cat =>
          cat.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      : true;

    const matchesCategory = selectedCategory === 'all'
      ? true
      : Array.isArray(nursery.categories) && nursery.categories.includes(selectedCategory);

    const matchesRegion = selectedRegion === 'all' || nursery.region === selectedRegion;
    const matchesCity = selectedCity === 'all' || nursery.city === selectedCity;
    const matchesDistrict = selectedDistrict === 'all' || nursery.district === selectedDistrict;
    
    const hasActiveOffer = getActiveDiscount(nursery.id) !== null;
    const matchesOffer = showOffersOnly ? hasActiveOffer : true;

    return matchesSearch && matchesCategory && matchesRegion && matchesCity && matchesDistrict && matchesOffer;
  });

  // 📊 Sort
  const sortedNurseries = [...filteredNurseries].sort((a, b) => {
    if (sortBy === 'newest') {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper function to generate page numbers array with ellipsis
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      // Add first page
      pages.push(1);

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('ellipsis');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }

      // Add last page if not already included
      if (totalPages !== 1) {
        pages.push(totalPages);
      }
    }

    // Remove duplicates (e.g., if totalPages=1)
    return [...new Set(pages)];
  };

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedRegion, selectedCity, selectedDistrict, showOffersOnly, sortBy]);

  // ✅ Loading Animation
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );

  return (
    <>
      <SEO
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        ogUrl="https://nurseries.qvtest.com/nurseries"
        canonical="https://nurseries.qvtest.com/nurseries"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-l from-yellow-700/80 to-emerald-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              دليل المشاتل الشامل 🌻
            </h1>
            <p className="text-xl mb-6 pt-6">
              اكتشف أكثر من 500 مشتل في جميع أنحاء المملكة
            </p>
          </div>
        </section>

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
                  className="w-full px-4 py-2 border border-green-800 rounded-full bg-gradient-to-r from-gray-100/80 to-gray-100 mb-6"
                />

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={loadingCategories}
                  className="w-full md:w-auto px-4 py-2 border border-green-800 rounded-full disabled:opacity-50"
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
                  className="w-full md:w-auto px-4 py-2 border border-green-800 rounded-full"
                >
                  <option value="all">جميع المناطق</option>
                  {allSaudiRegions.length > 0
                    ? allSaudiRegions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))
                    : regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))
                  }
                </select>

                {/* City Filter */}
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedDistrict('all');
                  }}
                  disabled={selectedRegion === 'all'}
                  className="w-full md:w-auto px-4 py-2 border border-green-800 rounded-full disabled:opacity-50"
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
                  disabled={selectedCity === 'all'}
                  className="w-full md:w-auto px-4 py-2 border border-green-800 rounded-full disabled:opacity-50"
                >
                  <option value="all">جميع الأحياء</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div> {/* ✅ This was missing! */}

              {/* Sort & Offers */}
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div>
                  <label className="ml-2">الترتيب حسب:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-green-800 rounded-full"
                  >
                    <option value="newest">الأحدث اولاً</option>
                    <option value="popular">الأكثر شهرة</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="mr-2 px-4 py-3 text-sm border bg-yellow-500/80 rounded-full ml-2 hover:bg-yellow-600/80 transition-all duration-500 ease-in-out">
                    المشاتل ذات عروض فقط
                  </label>
                  <input
                    type="checkbox"
                    checked={showOffersOnly}
                    onChange={(e) => setShowOffersOnly(e.target.checked)}
                    className="h-4 w-4 border border-yellow-600/80"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content - Nurseries Grid */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <p className="font-bold text-green-800">عُثر على {sortedNurseries.length} مشتل</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentNurseries.length > 0 ? (
                    currentNurseries.map((nursery) => (
                      <div key={nursery.id} className='hover:-translate-y-4 transition-transform duration-500 ease-in-out flex'>
                        <NurseryCard 
                          nursery={nursery} 
                          offers={offers}
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
                  <div className="flex justify-center items-center mt-8 gap-2">
                    {/* Previous Button (→ in RTL) */}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={`w-10 h-10 flex items-center justify-center text-sm font-semibold rounded-md shadow transition ${
                        currentPage === 1
                          ? 'opacity-50 cursor-not-allowed bg-white text-gray-400'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      →
                    </a>

                    {/* Page Numbers */}
                    {getPageNumbers().map((page, idx, arr) => {
                      // Show ellipsis if needed
                      if (page === 'ellipsis') {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="w-10 h-10 flex items-center justify-center text-sm font-semibold text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }

                      return (
                        <a
                          key={page}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          className={`w-10 h-10 flex items-center justify-center text-sm font-semibold rounded-md shadow transition ${
                            currentPage === page
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </a>
                      );
                    })}

                    {/* Next Button (← in RTL) */}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={`w-10 h-10 flex items-center justify-center text-sm font-semibold rounded-md shadow transition ${
                        currentPage === totalPages
                          ? 'opacity-50 cursor-not-allowed bg-white text-gray-400'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      ←
                    </a>
                  </div>
                )}
              </div>

              {/* Sidebars Container */}
              <div className="flex flex-col gap-8 lg:w-[320px]">
              {/* Sidebar - Premium Nurseries */}
              <aside className="lg:w-full">
                <div className="bg-gray-200 rounded-xl shadow-md p-6 sticky top-4">
                  <div className="flex items-center justify-center gap-2 bg-gray-900 text-white rounded-full px-6 py-3 mb-6">
                    <span className="text-xl">✨</span>
                    <h2 className="text-lg font-bold">شركاء النجاح</h2>
                  </div>

                  <hr className="mb-6 border-gray-200" />

                  <div className="space-y-4">
                    {/* Premium Nursery Card 1 */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border-2 border-transparent hover:border-[#32a852] transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-x-2">
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-200 rounded-full p-3 flex-shrink-0">
                          <span className="text-2xl">🌿</span>
                        </div>
                        <div className="flex-1 text-right">
                          <h3 className="font-bold text-green-800 mb-1">حدائق المملكة</h3>
                          <p className="text-sm text-gray-600">نباتات داخلية وخارجية مميزة</p>
                        </div>
                      </div>
                    </div>

                    {/* Premium Nursery Card 2 */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border-2 border-transparent hover:border-[#32a852] transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-x-2">
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-200 rounded-full p-3 flex-shrink-0">
                          <span className="text-2xl">🌸</span>
                        </div>
                        <div className="flex-1 text-right">
                          <h3 className="font-bold text-green-800 mb-1">مشاتل الرياض الخضراء</h3>
                          <p className="text-sm text-gray-600">تنسيق حدائق احترافي</p>
                        </div>
                      </div>
                    </div>

                    {/* Premium Nursery Card 3 */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border-2 border-transparent hover:border-[#32a852] transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-x-2">
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-200 rounded-full p-3 flex-shrink-0">
                          <span className="text-2xl">🌴</span>
                        </div>
                        <div className="flex-1 text-right">
                          <h3 className="font-bold text-green-800 mb-1">مؤسسة النخيل الذهبية</h3>
                          <p className="text-sm text-gray-600">متخصصون في أشجار النخيل النادرة</p>
                        </div>
                      </div>
                    </div>

                    {/* Premium Nursery Card 4 */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border-2 border-transparent hover:border-[#32a852] transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-x-2">
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-200 rounded-full p-3 flex-shrink-0">
                          <span className="text-2xl">☘️</span>
                        </div>
                        <div className="flex-1 text-right">
                          <h3 className="font-bold text-green-800 mb-1">مشتل الخليج الأخضر</h3>
                          <p className="text-sm text-gray-600">الرائد في النباتات المحلية والمستوردة</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
              
              {/* Sidebar - Latest Highlighted Offer */}
              {latestHighlightedOffer && (
                <aside className="lg:w-full">
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-amber-200 rounded-xl shadow-md p-6 sticky top-4 hover:border-yellow-600/80 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-102">
                    <a href="/offers">
                      <div className="flex items-center justify-center gap-2 bg-yellow-600/80 text-white rounded-full px-4 py-2 mb-4">
                        <span className="text-lg">🔥</span>
                        <h3 className="font-bold text-sm">عرض مميز</h3>
                      </div>
                      <h4 className="font-bold text-lg text-amber-800 mb-2 line-clamp-2">
                        {latestHighlightedOffer.title || 'عرض خاص'}
                      </h4>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-3 pb-4">
                        {latestHighlightedOffer.description || 'لا يوجد وصف متاح.'}
                      </p>
                      <div className="flex items-center justify-center gap-2 bg-yellow-600/40 text-amber-800 rounded-md px-4 py-2 mb-4">
                        <h3 className="font-bold text-base">شاهد العروض</h3>
                      </div>
                    </a>
                  </div>
                </aside>
              )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Nurseries;