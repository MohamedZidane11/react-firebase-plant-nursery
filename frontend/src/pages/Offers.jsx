// src/pages/Offers.jsx
import { useState, useEffect } from 'react';
import OfferCard from '../components/OfferCard';
import { useSEO } from '../hooks/useSEO';
import SEO from '../components/SEO';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // ✅ Changed from 3 to 9

  // 🔍 Filters
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { seo } = useSEO('offers');

  // 🌐 Fetch offers from backend
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch('https://nurseries.qvtest.com/api/offers'); //local => https://nurseries.qvtest.comapi/offers
        if (!response.ok) throw new Error('فشل تحميل العروض');
        const data = await response.json();
        setOffers(data);
      } catch (err) {
        console.error('Error fetching offers:', err);
        alert('تعذر الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // 🔎 Filter offers
  const filteredOffers = offers.filter((offer) => {
    // Filter by type
    if (filterType !== 'all') {
      if (filterType === 'discount' && offer.discount === null) return false;
      if (filterType === 'free_delivery' && !offer.tags.includes('توصيل')) return false;
      if (filterType === 'consultation' && !offer.tags.includes('استشارات')) return false;
    }

    // Filter by category
    if (filterCategory !== 'all') {
      if (!offer.tags.includes(filterCategory)) return false;
    }

    // ✅ Filter by service
    if (filterService !== 'all') {
      if (!offer.tags.includes(filterService)) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      // Helper to normalize createdAt to a Date
      const parseDate = (dateField) => {
        if (!dateField) return new Date(0);
        
        // If it's a Firestore Timestamp object (has _seconds)
        if (typeof dateField === 'object' && dateField._seconds) {
          return new Date(dateField._seconds * 1000);
        }
        
        // If it's a string (ISO format)
        return new Date(dateField);
      };
  
      const aTime = parseDate(a.createdAt);
      const bTime = parseDate(b.createdAt);
      return bTime - aTime; // newest first
    }
    if (sortBy === 'popular') return (b.highlighted ? 1 : 0) - (a.highlighted ? 1 : 0);
    if (sortBy === 'lowest_price' && a.discount !== null && b.discount !== null) {
      return a.discount - b.discount;
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
  const currentOffers = filteredOffers.slice(
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
  }, [filterType, filterCategory, filterService, sortBy]);

  if (loading) {
    return <p className="text-center py-8">جاري التحميل...</p>;
  }

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

  return (
    <>
      <SEO
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        ogUrl="https://nurseries.qvtest.com/offers"
        canonical="https://nurseries.qvtest.com/offers"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#34a0a4] to-[#fff3b0] text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 pb-4">
              العروض الخاصة 🎁
            </h1>
            <p className="text-xl mb-8">
              اكتشف أفضل العروض والخصومات من المشاتل المميزة
            </p>
            {/*<button className="bg-white text-yellow-600/80 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors">
              {filteredOffers.length} عرض نشط حالياً 🙌
            </button>*/}
          </div>
        </section>

        {/* Filters */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex flex-wrap gap-4 items-center justify-center">
                {/* Filter by Type */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md min-w-36"
                >
                  <option value="all">جميع العروض</option>
                  <option value="discount">خصومات</option>
                  <option value="free_delivery">توصيل مجاني</option>
                  <option value="consultation">استشارات مجانية</option>
                </select>

                {/* Filter by Category */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md min-w-36"
                >
                  <option value="all">جميع التصنيفات</option>
                  <option value="مشاتل"> مشاتل</option>
                  <option value="مشاتل مختلطة"> مشاتل متنوعة</option>
                  <option value="أدوات زراعة">أدوات زراعة</option>
                  <option value="نباتات داخلية">نباتات داخلية</option>
                  <option value="نباتات خارجية">نباتات خارجية</option>
                  <option value="زهور">زهور</option>
                </select>

                {/* Filter by Service */}
                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md min-w-36"
                >
                  <option value="all">جميع الخدمات</option>
                  <option value="تركيب وصيانة">تركيب وصيانة</option>
                  <option value="توصيل">توصيل</option>
                  <option value="ضمان نباتات">ضمان نباتات</option>
                  <option value="استشارات">استشارات</option>
                </select>

                {/* Sort by */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md min-w-36"
                >
                  <option value="newest">الأحدث أولاً</option>
                  <option value="popular">الأكثر شعبية</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Offers Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentOffers.length > 0 ? (
                currentOffers.map((offer) => (
                  <div 
                    key={offer.id} 
                    className='hover:-translate-y-4 transition-transform duration-500 ease-in-out flex'
                  >
                    <OfferCard offer={offer} />
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500 py-8">
                  لا توجد عروض مطابقة للبحث.
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
        </section>
      </div>
    </>  
  );
};

export default Offers;