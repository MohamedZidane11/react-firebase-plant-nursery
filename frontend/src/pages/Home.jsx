// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import defaultNurseryImage from '../assets/nurs_empty.png'; // ✅ Import default image

const Home = () => {
  // ✅ ALL HOOKS AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('home'); // 'home' or 'category-results'
  const [sponsors, setSponsors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [nurseries, setNurseries] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [banners, setBanners] = useState([]);
  
  // ✅ MOVED siteSettings HOOK TO THE TOP
  const [siteSettings, setSiteSettings] = useState({
    title: 'أكبر منصة للمشاتل في المملكة 🌿',
    subtitle: 'اكتشف أكثر من 500 مشتل ومتجر لأدوات الزراعة في مكان واحد',
    heroImage: 'https://placehold.co/1600x600/059669/ffffff?text=Plant+Nursery',
    benefits: ['معلومات كاملة', 'تواصل مباشر', 'خدمات مجانية']
  });

  // ✅ Fetch banner
  const sliderSettings = {
    dots: true,
    infinite: banners.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    rtl: true,
    arrows: false
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const API_BASE = 'https://nurseries.qvtest.com';
        const response = await fetch(`${API_BASE}/api/banners`);
        if (!response.ok) throw new Error('فشل تحميل البانرات');
        const data = await response.json();
        const activeBanners = data
          .filter(b => b.active)
          .sort((a, b) => a.position - b.position);
        setBanners(activeBanners);
      } catch (err) {
        console.error('Error fetching banners:', err);
        setBanners([]);
      }
    };
    fetchBanners();
  }, []);

  // ✅ Fetch nurseries
  useEffect(() => {
    const fetchNurseries = async () => {
      try {
        const API_BASE = 'https://nurseries.qvtest.com';
        const response = await fetch(`${API_BASE}/api/nurseries`);
        if (!response.ok) throw new Error('فشل تحميل المشاتل');
        const data = await response.json();
        setNurseries(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching nurseries:', err);
        setNurseries([]);
      }
    };

    fetchNurseries();
  }, []);

  // ✅ Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const API_BASE = 'https://nurseries.qvtest.com';
        const response = await fetch(`${API_BASE}/api/offers`);
        if (!response.ok) throw new Error('فشل تحميل العروض');
        const data = await response.json();
        setOffers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setOffers([]);
      }
    };

    fetchOffers();
  }, []);

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_BASE = 'https://nurseries.qvtest.com';
        const response = await fetch(`${API_BASE}/api/categories`);
        if (!response.ok) throw new Error('فشل تحميل التصنيفات');
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ✅ Fetch sponsors
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const API_BASE = 'https://nurseries.qvtest.com';
        const response = await fetch(`${API_BASE}/api/sponsors`);
        if (!response.ok) throw new Error('فشل تحميل الرعاة');
        const data = await response.json();
        setSponsors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching sponsors:', err);
        setSponsors([]);
      } finally {
        setSponsorsLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  // ✅ MOVED siteSettings useEffect TO THE TOP
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_BASE = 'https://nurseries.qvtest.com';
        const response = await fetch(`${API_BASE}/api/settings/site`);
        if (response.ok) {
          const data = await response.json();
          setSiteSettings(data);
        }
      } catch (err) {
        console.warn('Failed to load site settings, using defaults.', err);
      }
    };
    fetchSettings();
  }, []);

  // ✅ Combine and filter results
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
      setResults([]);
      return;
    }

    const results = [];

    // 🔍 Search nurseries
    nurseries.forEach(n => {
      if (
        n.name.toLowerCase().includes(term) ||
        n.location.toLowerCase().includes(term) ||
        n.region?.toLowerCase().includes(term) ||
        n.city?.toLowerCase().includes(term) ||
        n.district?.toLowerCase().includes(term) ||
        n.categories.some(cat => cat.toLowerCase().includes(term)) ||
        n.services.some(svc => svc.toLowerCase().includes(term))
      ) {
        results.push({
          type: 'nursery',
          id: n.id,
          title: n.name,
          subtitle: n.location,
          link: `/nurseries/${n.id}`,
          tags: n.categories.slice(0, 2)
        });
      }
    });

    // 🔍 Search offers
    offers.forEach(o => {
      if (
        o.title.toLowerCase().includes(term) ||
        o.description.toLowerCase().includes(term) ||
        o.tags.some(tag => tag.toLowerCase().includes(term)) ||
        o.nurseryName?.toLowerCase().includes(term)
      ) {
        results.push({
          type: 'offer',
          id: o.id,
          title: o.title,
          subtitle: `من: ${o.nurseryName || 'عرض عام'}`,
          link: `/offers/${o.id}`,
          tags: o.tags.slice(0, 2)
        });
      }
    });

    // 🔍 Search categories
    categories.forEach(c => {
      if (
        c.title.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
      ) {
        results.push({
          type: 'category',
          id: c.id,
          title: c.title,
          subtitle: 'تصنيف متاح',
          link: '/nurseries',
          tags: ['تصنيف']
        });
      }
    });

    setResults(results);
  }, [searchTerm, nurseries, offers, categories]);

  // ✅ CONDITIONAL RETURN MOVED AFTER ALL HOOKS
  if (loading || sponsorsLoading) {
    return <p className="text-center py-8">جاري التحميل...</p>;
  }

  // ✅ Define filters
  const filters = [
    { key: 'all', label: 'الكل' },
    { key: 'category', label: 'تصنيفات' },
    { key: 'service', label: 'خدمات' }
  ];

  // ✅ Filter results by active filter
  const filteredResults = results.filter(result => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'category') return result.type === 'category';
    if (activeFilter === 'service') return ['nursery', 'offer'].includes(result.type) && (
      nurseries.find(n => n.id === result.id && n.services.some(s => s === 'consultation' || s === 'delivery' || s === 'installation' || s === 'maintenance'))
    );
    return true;
  });

  // ✅ Get featured nurseries (controlled by admin)
  const featuredNurseries = nurseries.filter(n => n.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-100 to-green-200 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
            {siteSettings.title || 'أكبر منصة للمشاتل في المملكة 🌿'}
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            {siteSettings.subtitle || 'اكتشف أكثر من 500 مشتل ومتجر لأدوات الزراعة في مكان واحد'}
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {(siteSettings.benefits || ['معلومات كاملة', 'تواصل مباشر', 'خدمات مجانية']).map((benefit, i) => (
              <div key={i} className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const resultsSection = document.getElementById('search-results');
                    if (resultsSection) {
                      resultsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="relative"
                >
                  <button
                    type="submit"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>

                  <input
                    type="text"
                    placeholder="ابحث عن مشتل، عرض، منطقة، تصنيف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-12 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </form>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    activeFilter === filter.key
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          {searchTerm && (
            <div id="search-results" className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-green-800 mb-4">
                نتائج البحث لـ "{searchTerm}"
              </h3>

              {filteredResults.length > 0 ? (
                <div className="space-y-4">
                  {filteredResults.map((result) => (
                    <Link
                      key={result.id}
                      to={result.link}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between">
                        <h4 className="font-bold text-gray-800">{result.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          result.type === 'nursery' ? 'bg-green-100 text-green-800' :
                          result.type === 'offer' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {result.type === 'nursery' ? 'مشتل' :
                           result.type === 'offer' ? 'عرض' : 'تصنيف'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{result.subtitle}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.tags.map((tag, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">لا توجد نتائج مطابقة للبحث.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Banner Slider */}
{banners.length > 0 && (
  <section className="py-4">
    <Slider {...sliderSettings}>
      {banners.map((banner) => (
        <div key={banner.id} className="px-4">
          <img
            src={banner.imageUrl}
            alt={`بانر ${banner.position}`}
            className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md"
            loading="lazy"
          />
        </div>
      ))}
    </Slider>
  </section>
)}

      {/* Categories Grid */}
      {viewMode === 'home' && (
        <section className="py-12 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-green-800 mb-12">التصنيف الرئيسى</h2>

            {categories.length === 0 ? (
              <p className="text-center text-gray-500">لا توجد تصنيفات.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {categories.map((cat, index) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.title);
                      setViewMode('category-results');
                    }}
                    className="text-white rounded-xl shadow-lg text-center cursor-pointer hover:scale-105 transition-all duration-500 ease-in-out transform hover:shadow-2xl"
                  >
                    {/* IMAGE CONTAINER — Gradient Background */}
                    <div className={`p-6 rounded-t-xl ${
                      index % 3 === 0 
                        ? 'bg-gradient-to-br from-yellow-50 to-yellow-200' 
                        : index % 3 === 1 
                          ? 'bg-gradient-to-br from-yellow-50 to-yellow-200' 
                          : 'bg-gradient-to-br from-yellow-50 to-yellow-200'
                    }`}>
                      <div className="w-20 h-20 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/100x100/ffffff/6b7280?text=No+Image';
                            }}
                          />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* TEXT CONTAINER — Matching Gradient */}
                    <div className={`p-6 rounded-b-xl ${
                      index % 3 === 0 
                        ? 'bg-gradient-to-tr from-pink-400 to-rose-500' 
                        : index % 3 === 1 
                          ? 'bg-gradient-to-tr from-teal-600 to-emerald-700' 
                          : 'bg-gradient-to-tr from-blue-400 to-indigo-500'
                    }`}>
                      <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                      <p className="text-sm opacity-90">{cat.description || 'تفاصيل غير متوفرة'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Nurseries (Fixed Layout) */}
      {viewMode === 'home' && featuredNurseries.length > 0 && (
        <section className="py-12">
          <div className="w-full">
            <h2 className="text-3xl font-bold text-center text-green-800 mb-8 px-4">أبرز المشاتل ✨</h2>

            {/* Fixed: Full width scroll with proper padding */}
            <div className="w-full overflow-x-auto scroll-smooth pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div 
                className="flex gap-6 px-4 hide-scrollbar"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                
                {featuredNurseries.map((nursery) => (
                  <Link 
                    key={nursery.id} 
                    to={`/nurseries/${nursery.id}`}
                    className="flex-shrink-0 w-72 hover:-translate-y-4 transition-transform duration-500 ease-in-out"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="bg-green-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-yellow-500 h-full flex flex-col items-center">
                      <div className="w-20 h-20 mb-4 bg-green-200 rounded-full flex items-center justify-center overflow-hidden">
                        <img
                          src={nursery.image || defaultNurseryImage}
                          alt={nursery.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = defaultNurseryImage;
                          }}
                        />
                      </div>
                      <h3 className="text-lg font-bold text-green-800 text-center line-clamp-1">{nursery.name}</h3>
                      <p className="text-sm text-gray-600 text-center mt-1 line-clamp-1">{nursery.location}</p>
                      <div className="flex justify-center mt-2 flex-wrap gap-1">
                        {nursery.categories.slice(0, 2).map((cat, i) => (
                          <span
                            key={i}
                            className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full whitespace-nowrap"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>

                      {/* Services Icons */}
                      <div className="mt-4 flex justify-center flex-wrap gap-x-6 gap-y-2">
                        {nursery.services?.includes('consultation') && (
                          <div className="flex flex-col items-center">
                            <div className="p-2 bg-gray-100 rounded-full">
                              <img src="https://img.icons8.com/stickers/26/consultation.png" alt="استشارة" className="w-6 h-6" />
                            </div>
                            <span className="inline-flex items-center rounded-full bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 mt-1">
                              استشارة
                            </span>
                          </div>
                        )}

                        {nursery.services?.includes('delivery') && (
                          <div className="flex flex-col items-center">
                            <div className="p-2 bg-gray-100 rounded-full">
                              <img src="https://img.icons8.com/color/26/truck--v1.png" alt="توصيل" className="w-6 h-6" />
                            </div>
                            <span className="inline-flex items-center rounded-full bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-500 mt-1">
                              توصيل
                            </span>
                          </div>
                        )}

                        {nursery.services?.includes('installation') && (
                          <div className="flex flex-col items-center">
                            <div className="p-2 bg-gray-100 rounded-full">
                              <img src="https://img.icons8.com/offices/26/hand-planting.png" alt="تركيب" className="w-6 h-6" />
                            </div>
                            <span className="inline-flex items-center rounded-full bg-green-400/10 px-2 py-1 text-xs font-medium text-green-500 mt-1">
                              تركيب
                            </span>
                          </div>
                        )}

                        {nursery.services?.includes('maintenance') && (
                          <div className="flex flex-col items-center">
                            <div className="p-2 bg-gray-100 rounded-full">
                              <img src="https://img.icons8.com/office/26/maintenance.png" alt="صيانة" className="w-6 h-6" />
                            </div>
                            <span className="inline-flex items-center rounded-full bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 mt-1">
                              صيانة
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {selectedCategory && (
              <div className="text-center mt-6">
                {/* <button
                  onClick={() => setViewMode('category-results')}
                  className="text-green-600 hover:underline"
                >
                  ← عرض المشاتل في تصنيف: {selectedCategory}
                </button> */}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ==================== */}
      {/* Category Results Section */}
      {/* ==================== */}
      {viewMode === 'category-results' && selectedCategory && (
        <section className="py-12 bg-white">
          <div className="w-full">
            <h2 className="text-3xl font-bold text-center text-green-800 mb-8 px-4">
              المشاتل في تصنيف: {selectedCategory}
            </h2>
            <div className="w-full overflow-x-auto scroll-smooth pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex gap-6 px-4 hide-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>

            {/* Outer centering wrapper */}
            <div className="flex justify-center w-full">
              <div 
                className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory space-x-6 pb-4 hide-scrollbar max-w-full"
                dir="rtl"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {nurseries
                  .filter(nursery => nursery.categories.includes(selectedCategory))
                  .map((nursery) => (
                    <Link 
                      key={nursery.id} 
                      to={`/nurseries/${nursery.id}`}
                      className="flex-shrink-0 w-48"
                    >
                      <div className="bg-green-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-green-200 rounded-full flex items-center justify-center overflow-hidden">
                          <img
                            src={nursery.image || defaultNurseryImage}
                            alt={nursery.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = defaultNurseryImage;
                            }}
                          />
                        </div>
                        <h3 className="text-lg font-bold text-green-800 text-center">{nursery.name}</h3>
                        <p className="text-sm text-gray-600 text-center">{nursery.location}</p>
                        <div className="flex justify-center mt-2 flex-wrap gap-1">
                          {nursery.categories.slice(0, 2).map((cat, i) => (
                            <span
                              key={i}
                              className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>

                        {/* ✅ SERVICES — HORIZONTAL INLINE */}
                        <div className="mt-3 flex justify-center gap-3 flex-wrap">
                          {nursery.services?.includes('consultation') && (
                            <div className="flex flex-col items-center">
                              <div className="p-1.5 bg-white border border-gray-200 rounded-full">
                                <img src="https://img.icons8.com/stickers/26/consultation.png" alt="استشارة" className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] text-blue-600 font-medium mt-0.5">استشارة</span>
                            </div>
                          )}

                          {nursery.services?.includes('delivery') && (
                            <div className="flex flex-col items-center">
                              <div className="p-1.5 bg-white border border-gray-200 rounded-full">
                                <img src="https://img.icons8.com/color/26/truck--v1.png" alt="توصيل" className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] text-yellow-600 font-medium mt-0.5">توصيل</span>
                            </div>
                          )}

                          {nursery.services?.includes('installation') && (
                            <div className="flex flex-col items-center">
                              <div className="p-1.5 bg-white border border-gray-200 rounded-full">
                                <img src="https://img.icons8.com/offices/26/hand-planting.png" alt="تركيب" className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] text-green-600 font-medium mt-0.5">تركيب</span>
                            </div>
                          )}

                          {nursery.services?.includes('maintenance') && (
                            <div className="flex flex-col items-center">
                              <div className="p-1.5 bg-white border border-gray-200 rounded-full">
                                <img src="https://img.icons8.com/office/26/maintenance.png" alt="صيانة" className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] text-red-600 font-medium mt-0.5">صيانة</span>
                            </div>
                          )}
                        </div>
                        {/* ✅ END SERVICES */}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
            </div>
            </div>

            {/* Back to Categories */}
            <div className="text-center mt-6">
              <button
                onClick={() => setViewMode('home')}
                className="text-green-600 hover:underline text-lg"
              >
                ← عودة الي التصنيفات
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ✅ Show All Nurseries Button — center */}
      <div className="flex items-center justify-center mb-10">
        <Link to="/nurseries">
          <button className="text-xl text-white bg-gradient-to-l from-yellow-600 to-yellow-500 hover:bg-green-700 px-10 py-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
          عرض جميع المشاتل 🌿
          </button>
        </Link>
      </div>

      {/* Premium Nurseries */}
      {viewMode === 'home' && (
        <section className="py-12 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">شركاء النجاح ✨</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 border border-yellow-500 p-6 rounded-lg text-center hover:-translate-y-2 transition-transform duration-500 ease-in-out">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">حدائق المملكة</h3>
                <p className="text-sm text-gray-300">نباتات داخلية وخارجية مميزة</p>
              </div>

              <div className="bg-gray-800 border border-yellow-500 p-6 rounded-lg text-center hover:-translate-y-2 transition-transform duration-500 ease-in-out">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">مشاتل الرياض الخضراء</h3>
                <p className="text-sm text-gray-300">تنسيق حدائق احترافي</p>
              </div>

              <div className="bg-gray-800 border border-yellow-500 p-6 rounded-lg text-center hover:-translate-y-2 transition-transform duration-500 ease-in-out">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">مؤسسة النخيل الذهبية</h3>
                <p className="text-sm text-gray-300">متخصصون في أشجار النخيل النادرة</p>
              </div>

              <div className="bg-gray-800 border border-yellow-500 p-6 rounded-lg text-center hover:-translate-y-2 transition-transform duration-500 ease-in-out">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">مشتل الخليج الأخضر</h3>
                <p className="text-sm text-gray-300">الرائد في النباتات المحلية والمستوردة</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sponsors Banner */}
      {viewMode === 'home' && (
        <section className="py-12 bg-gradient-to-r from-amber-50 to-yellow-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold"> ✨</h2>
            </div>
            {sponsors.length === 0 ? (
              <p className="text-center text-gray-400">لا توجد رعاة حالياً.</p>
            ) : (
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 overflow-x-auto pb-4 pt-3">
                {sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="text-center min-w-[120px] md:min-w-[160px] hover:scale-105 transition-transform duration-500 ease-in-out">
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 bg-yellow-500 border-4 border-yellow-400 rounded-full flex items-center justify-center overflow-hidden">
                      {sponsor.logo ? (
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/100x100/fbbf24/ffffff?text=Sponsor';
                          }}
                        />
                      ) : (
                        <span className="text-black font-bold text-sm">Logo</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold">{sponsor.name}</h3>
                    {sponsor.blurb && (
                      <p className="text-sm text-gray-900">{sponsor.blurb}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      <section>
        <div className="mx-auto mt-8 max-w-8xl px-6 sm:mt-8 lg:px-8 mb-8">
          <div
            className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 shadow-2xl rounded-2xl sm:rounded-3xl sm:px-18 xl:py-16">
          
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl mb-8">
              هل تملك مشتلًا؟
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-gray-300">
            انضم إلى منصتنا واحصل على المزيد من العملاء
            </p>
            <div className="flex items-center justify-center mb-4 mt-10">
              <Link to="/register">
                <button className="text-xl text-white bg-gradient-to-l from-yellow-600 to-yellow-500 hover:bg-green-700 px-10 py-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
                📝 سجل مشتلك الآن
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;