// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { offers } from '../data/offers';

console.log('✅ Home Component Loaded');

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sponsors, setSponsors] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ New state
  const [loading, setLoading] = useState(true); // ✅ Loading state
  const [sponsorsLoading, setSponsorsLoading] = useState(true);

  // ✅ Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_BASE = 'https://react-firebase-plant-nursery-production.up.railway.app'; // 🔁 Replace with your Railway URL
        const response = await fetch(`${API_BASE}/api/categories`);

        if (!response.ok) throw new Error('فشل تحميل التصنيفات');

        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]); // Fallback to empty
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);


  // 🔎 Filter offers based on search and filter
  const filteredOffers = offers.filter((offer) => {
    // Search in title, description, tags
    const matchesSearch = searchTerm
      ? offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    // Filter by category
    const matchesFilter = activeFilter === 'all' ? true : offer.tags.includes(activeFilter);

    return matchesSearch && matchesFilter;
  });

  // ✅ Fetch sponsors from backend
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const API_BASE = 'https://react-firebase-plant-nursery-production.up.railway.app'; // 🔁 Replace with your URL
        const response = await fetch(`${API_BASE}/api/sponsors`);

        if (!response.ok) throw new Error('فشل تحميل الرعاة');

        const data = await response.json();
        setSponsors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching sponsors:', err);
        setSponsors([]); // Fallback to empty
      } finally {
        setSponsorsLoading(false);
      }
    };

    fetchSponsors();
  }, []);


  if (loading || sponsorsLoading) {
    return <p className="text-center py-8">جاري التحميل...</p>;
  }


  // 🏷️ Define available filters
  const filters = [
    { key: 'all', label: 'الكل' },
    { key: 'نباتات داخلية', label: 'نباتات داخلية' },
    { key: 'زهور', label: 'زهور' },
    { key: 'نباتات خارجية', label: 'نباتات خارجية' },
    { key: 'أدوات زراعة', label: 'أدوات زراعة' },
    { key: 'توصيل', label: 'توصيل' },
    { key: 'استشارات', label: 'استشارات' }
  ];

  // 🖼️ Get the first filtered offer for "Current Offers" section
  const featuredOffer = filteredOffers[0] || offers[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-100 to-green-200 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
            أكبر منصة للمشاتل في المملكة 🌿
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            اكتشف أكثر من 500 مشتل ومتجر لأدوات الزراعة في مكان واحد
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800">معلومات كاملة</span>
            </div>

            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800">تواصل مباشر</span>
            </div>

            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800">خدمات مجانية</span>
            </div>
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
                    placeholder="ابحث عن مشتل، عرض، منطقة..."
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
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-12">التصنيفات الرئيسية</h2>

          {categories.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد تصنيفات.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-green-600 text-white p-6 rounded-xl shadow-lg text-center">
                  {/* Image */}
                  <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center overflow-hidden">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/100x100/10b981/ffffff?text=No+Image';
                        }}
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-2">{cat.title}</h3>

                  {/* Description */}
                  <p className="text-sm opacity-90">{cat.description || 'تفاصيل غير متوفرة'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Nurseries */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-12">أبرز المشاتل</h2>

          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-6 justify-center">
              <div className="bg-green-100 p-6 rounded-xl shadow-lg min-w-[200px]">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-200 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-green-800 text-center">مشتل البستان</h3>
                <p className="text-sm text-gray-600 text-center">المدينة - حي العزيزية</p>
                <div className="flex justify-center mt-2 space-x-2">
                  <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">استشارات</span>
                  <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">ضمان</span>
                </div>
              </div>

              <div className="bg-green-100 p-6 rounded-xl shadow-lg min-w-[200px]">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-200 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.12a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.12a1 1 0 00-1.175 0l-3.976 2.12c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.12c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-green-800 text-center">مشتل الزهور</h3>
                <p className="text-sm text-gray-600 text-center">الدمام - حي الفيصليّة</p>
                <div className="flex justify-center mt-2 space-x-2">
                  <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">تركيب</span>
                  <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">توصيل</span>
                </div>
              </div>

              <div className="bg-green-100 p-6 rounded-xl shadow-lg min-w-[200px]">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-200 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V7.414A2 2 0 0018 5.414V4a2 2 0 00-2-2H8a2 2 0 00-2 2v1.414A2 2 0 008 8.414V16a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-green-800 text-center">مشتل النخيل</h3>
                <p className="text-sm text-gray-600 text-center">جدة - حي الصفا</p>
                <div className="flex justify-center mt-2 space-x-2">
                  <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">استشارات</span>
                  <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">توصيل</span>
                </div>
              </div>

              <div className="bg-green-100 p-6 rounded-xl shadow-lg min-w-[200px]">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-200 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-green-800 text-center">مشتل الربيع</h3>
                <p className="text-sm text-gray-600 text-center">الرياض - حي النخيل</p>
                <div className="flex justify-center mt-2 space-x-2">
                  <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">ضمان</span>
                  <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">تركيب</span>
                  <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">توصيل</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Nurseries */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">شركاء النجاح ✨</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 border border-yellow-500 p-6 rounded-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">حدائق المملكة</h3>
              <p className="text-sm text-gray-300">نباتات داخلية وخارجية مميزة</p>
            </div>

            <div className="bg-gray-800 border border-yellow-500 p-6 rounded-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">مشاتل الرياض الخضراء</h3>
              <p className="text-sm text-gray-300">تنسيق حدائق احترافي</p>
            </div>

            <div className="bg-gray-800 border border-yellow-500 p-6 rounded-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">مؤسسة النخيل الذهبية</h3>
              <p className="text-sm text-gray-300">متخصصون في أشجار النخيل النادرة</p>
            </div>

            <div className="bg-gray-800 border border-yellow-500 p-6 rounded-lg text-center">
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

      {/* Sponsors Banner */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">الرعاة الرسميون ✨</h2>
          </div>

          {sponsors.length === 0 ? (
            <p className="text-center text-gray-400">لا توجد رعاة حالياً.</p>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 overflow-x-auto pb-4">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="text-center min-w-[120px] md:min-w-[160px]"
                >
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
                    <p className="text-sm text-gray-300">{sponsor.blurb}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;