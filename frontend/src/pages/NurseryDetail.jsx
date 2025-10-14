// src/pages/NurseryDetail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import defaultNurseryImage from '../assets/nurs_empty.png';

const NurseryDetail = () => {
  const { id } = useParams();
  const [nursery, setNursery] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ✅ Fetch nursery and offers
  useEffect(() => {
    const API_BASE = 'http://localhost:5000';

    const fetchNursery = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/nurseries/${id}`);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        setNursery(data);
      } catch (err) {
        console.error('Error fetching nursery:', err);
        setNursery(null);
      }
    };

    const fetchOffers = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/offers`);
        if (!response.ok) throw new Error('Failed to fetch offers');
        const allOffers = await response.json();
        const nurseryOffers = allOffers.filter(offer => offer.nurseryId === id);
        setOffers(nurseryOffers);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setOffers([]);
      }
    };

    Promise.all([fetchNursery(), fetchOffers()]).finally(() => {
      setLoading(false);
    });
  }, [id]);

  // ✅ Lightbox keyboard handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      }
      if (e.key === 'ArrowLeft') {
        prevImage();
      }
      if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    if (lightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [lightboxOpen]);

  // Early returns after all Hooks
  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;
  if (!nursery) return <div className="text-center py-8">المشتل غير موجود أو غير منشور</div>;

  // Helper functions
  const formatPhone = (phone) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10 && digits.startsWith('5')) {
      return `+966 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    }
    return phone;
  };

  const getActiveDiscount = () => {
    const activeOffer = offers.find(offer => 
      offer.published !== false && 
      new Date(offer.endDate) > new Date()
    );
    return activeOffer ? activeOffer.discount : null;
  };

  const locationParts = nursery.location?.split(' - ') || ['', '', ''];
  const region = locationParts[0] || '';
  const city = locationParts[1] || '';
  const district = locationParts[2] || '';

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (nursery.album?.length || 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (nursery.album?.length || 1)) % (nursery.album?.length || 1));
  };

  // ✅ Add to browser bookmarks
  const addToBookmarks = () => {
    const pageTitle = `${nursery.name} - مشتل`;
    const pageUrl = window.location.href;

    // Try different methods based on browser
    if (window.sidebar && window.sidebar.addPanel) {
      // Firefox
      window.sidebar.addPanel(pageTitle, pageUrl, '');
    } else if (window.external && ('AddFavorite' in window.external)) {
      // IE
      window.external.AddFavorite(pageUrl, pageTitle);
    } else if (window.opera && window.print) {
      // Opera
      const elem = document.createElement('a');
      elem.setAttribute('href', pageUrl);
      elem.setAttribute('title', pageTitle);
      elem.setAttribute('rel', 'sidebar');
      elem.click();
    } else {
      // For modern browsers - show instruction
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const shortcut = isMac ? 'Cmd+D' : 'Ctrl+D';
      alert(`لإضافة هذه الصفحة إلى المفضلة، اضغط ${shortcut} على لوحة المفاتيح`);
    }
  };

  // ✅ Open WhatsApp
  const openWhatsApp = () => {
    const phone = nursery.phones?.[0] || '';
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappNumber = cleanPhone.startsWith('966') ? cleanPhone : `966${cleanPhone}`;
    const message = encodeURIComponent(`مرحباً، أنا مهتم بمشتل ${nursery.name}`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  // ✅ Make a call
  const makeCall = () => {
    const phone = nursery.phones?.[0] || '';
    window.location.href = `tel:${phone}`;
  };

  const allImages = [nursery.image || defaultNurseryImage, ...(nursery.album || [])];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <Link to="/nurseries" className="text-green-600 hover:underline mb-4 inline-block">
            ← العودة إلى المشاتل
          </Link>
        </div>
      </section>

      {/* Hero Banner */}
      <section className="bg-gradient-to-l from-green-800 to-emerald-600 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left: Text */}
            <div className="md:w-1/2">
              <h1 className="text-4xl font-bold mb-2 pb-2">{nursery.name}</h1>
              {nursery.description && (
                <p className="text-lg mb-4 opacity-90 pt-4 pb-4">
                  {nursery.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mb-6 pb-4">
                {nursery.categories?.map((category, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 pt-6">
                <button 
                  onClick={addToBookmarks}
                  className="bg-white text-green-600 px-6 py-3 rounded-full font-medium shadow-md hover:bg-gray-100 transition-all"
                >
                  🔖 أضف للمفضلة
                </button>
                <button 
                  onClick={openWhatsApp}
                  className="bg-green-600 text-white px-6 py-3 rounded-full font-medium hover:bg-green-700 transition-all"
                >
                  💬 واتساب 
                </button>
                <button 
                  onClick={makeCall}
                  className="bg-yellow-600 text-white px-6 py-3 rounded-full font-medium hover:bg-yellow-700 transition-all"
                >
                  📞 اتصل الآن 
                </button>
              </div>
            </div>

            {/* Right: Image & Badge */}
            <div className="md:w-1/2 flex flex-col items-center">
              <div className="relative w-full h-64 mb-4">
                <img
                  src={nursery.image || defaultNurseryImage}
                  alt={nursery.name}
                  onError={(e) => {
                    e.target.src = defaultNurseryImage;
                  }}
                  className="w-full h-full object-cover rounded-xl cursor-pointer"
                  onClick={() => openLightbox(0)}
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {nursery.featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">
                      ⭐ مميز 
                    </span>
                  )}
                </div>
              </div>
              
              {nursery.album && nursery.album.length > 0 && (
                <div className="flex justify-center gap-2 mt-4">
                  {nursery.album.slice(0, 4).map((imageUrl, index) => (
                    <div 
                      key={index} 
                      className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => openLightbox(index + 1)}
                    >
                      <img 
                        src={imageUrl} 
                        alt={`صورة ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = defaultNurseryImage;
                        }}
                      />
                    </div>
                  ))}
                  {nursery.album.length > 4 && (
                    <div 
                      className="w-12 h-12 rounded-lg bg-black bg-opacity-50 text-white flex items-center justify-center text-sm font-bold cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => openLightbox(5)}
                    >
                      +{nursery.album.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Services */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-103 transition-all duration-500 ease-in-out transform hover:shadow-2xl">
              <h3 className="text-3xl font-bold text-green-800 mb-4 pb-4">✨ الخدمات المتاحة</h3>
              <div className="flex flex-wrap gap-4">
                {nursery.services?.includes('consultation') && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-300 hover:bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    <div className="p-1 bg-gray-100 rounded-full">
                      <img src="https://img.icons8.com/stickers/26/consultation.png" alt="استشارات" />
                    </div>
                    <span>استشارات</span>
                  </div>
                )}
                {nursery.services?.includes('delivery') && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-300 hover:bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    <div className="p-1 bg-gray-100 rounded-full">
                      <img src="https://img.icons8.com/color/26/truck--v1.png" alt="توصيل" />
                    </div>
                    <span>توصيل</span>
                  </div>
                )}
                {nursery.services?.includes('installation') && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-300 hover:bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    <div className="p-1 bg-gray-100 rounded-full">
                      <img src="https://img.icons8.com/offices/26/hand-planting.png" alt="تركيب" />
                    </div>
                    <span>تركيب</span>
                  </div>
                )}
                {nursery.services?.includes('maintenance') && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-300 hover:bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    <div className="p-1 bg-gray-100 rounded-full">
                      <img src="https://img.icons8.com/office/26/maintenance.png" alt="صيانة" />
                    </div>
                    <span>صيانة</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-103 transition-all duration-500 ease-in-out transform hover:shadow-2xl">
              <h3 className="text-3xl font-bold text-green-800 mb-4 pb-4">🕐 ساعات العمل </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>السبت - الخميس</span>
                  <span>9:00 ص - 9:00 م</span>
                </div>
                <div className="flex justify-between">
                  <span>الجمعة</span>
                  <span>4:00 م - 10:00 م</span>
                </div>
              </div>
              <div className="mt-6">
                <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700">
                  مفتوح الآن 🟢
                </button>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-103 transition-all duration-500 ease-in-out transform hover:shadow-2xl">
              <h3 className="text-3xl font-bold text-green-800 mb-4 pb-4">ℹ️ معلومات التواصل </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="ml-4">
                    <strong className="block">📍 العنوان:</strong>
                    <span>{region} - {city} - {district}</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="ml-4">
                    <strong className="block">📞 الهاتف:</strong>
                    {nursery.phones && nursery.phones.length > 0 ? (
                      <div className="space-y-1">
                        {nursery.phones.map((phone, index) => (
                          <div key={index}>{formatPhone(phone)}</div>
                        ))}
                      </div>
                    ) : (
                      <span>+966 55 123 4567</span>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="ml-4">
                    <strong className="block">📧 البريد الإلكتروني:</strong>
                    <span>{nursery.socialMedia?.email || 'info@nursery.com'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Offers */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-green-800 mb-6">🎁 العروض الحالية </h2>
            {offers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                  <div key={offer.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 hover:-translate-y-2 transition-transform duration-500 ease-in-out">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={offer.image || '/images/offer_default.png'}
                        alt={offer.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/offer_default.png';
                        }}
                      />
                    </div>
                    <div className="p-6 bg-orange-300/50">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-gray-800">{offer.title}</h3>
                        {offer.discount && (
                          <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full whitespace-nowrap">
                            خصم {offer.discount}%
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800 text-base mb-4 line-clamp-2">{offer.description}</p>
                      <div className="text-sm text-red-700 font-bold">
                        <strong>⏰ ينتهي في:</strong> {offer.endDate || 'غير محدد'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">لا توجد عروض حالية من هذا المشتل.</p>
            )}
          </div>

          {/* Social Media */}
          {nursery.socialMedia && (
            <div className="mt-12 bg-yellow-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-green-800 mb-4">تابعنا على وسائل التواصل</h3>
              <div className="flex flex-wrap gap-4">
                {nursery.socialMedia.instagram && (
                  <a href={nursery.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center text-pink-600 hover:text-pink-800">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                    <span className="ml-2">إنستغرام</span>
                  </a>
                )}
                {nursery.socialMedia.twitter && (
                  <a href={nursery.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center text-sky-500 hover:text-sky-700">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                    <span className="ml-2">تويتر</span>
                  </a>
                )}
                {nursery.socialMedia.facebook && (
                  <a href={nursery.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    <span className="ml-2">فيسبوك</span>
                  </a>
                )}
                {nursery.socialMedia.snapchat && (
                  <a
                    href={nursery.socialMedia.snapchat}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-yellow-500 hover:text-yellow-700"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="14" fill="#FFFA37"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M21.0255 8.18551C20.0601 6.96879 18.4673 6 16.0118 6C13.9091 6.02071 9.70378 7.18445 9.70378 11.6738C9.70378 12.3294 9.75568 13.2075 9.80103 13.8541C9.74758 13.8386 9.68188 13.8095 9.57775 13.7596L9.56328 13.7527C9.37915 13.6643 9.09918 13.5298 8.7098 13.5298C8.31645 13.5298 7.93611 13.6839 7.65375 13.9124C7.37309 14.1394 7.13333 14.4885 7.13333 14.9105C7.13333 15.4384 7.43041 15.7888 7.77778 16.0135C8.08632 16.2131 8.47538 16.3406 8.78337 16.4415L8.81382 16.4514C9.14349 16.5596 9.3851 16.642 9.55169 16.7458C9.68136 16.8267 9.70104 16.8778 9.70348 16.9264C9.70179 16.9333 9.69782 16.9482 9.68919 16.9724C9.67141 17.0224 9.64184 17.0899 9.59862 17.1743C9.5124 17.3427 9.38667 17.5498 9.23711 17.7706C8.93539 18.2161 8.56717 18.673 8.29212 18.9376C8.02082 19.1986 7.57562 19.5229 7.11016 19.7811C6.87933 19.9091 6.6536 20.0152 6.45167 20.0881C6.24322 20.1633 6.09047 20.192 5.99608 20.192C5.92136 20.192 5.85669 20.2073 5.82847 20.2144C5.7888 20.2243 5.74774 20.2374 5.70713 20.2527C5.62657 20.2829 5.53056 20.3283 5.43546 20.3923C5.25377 20.5146 5 20.7612 5 21.1502C5 21.3532 5.04766 21.5251 5.13005 21.6742C5.20217 21.8047 5.29487 21.9038 5.34823 21.9608L5.35615 21.9692L5.37091 21.9851C5.66435 22.3008 6.15008 22.5205 6.62162 22.6712C7.02679 22.8007 7.4798 22.8972 7.92122 22.9551C7.92745 22.9836 7.93397 23.0142 7.9411 23.0478L7.9434 23.0587C7.97119 23.1897 8.008 23.3633 8.06221 23.5234C8.11336 23.6744 8.20599 23.8977 8.39564 24.0568C8.63717 24.2593 8.95308 24.2798 9.1592 24.279C9.38047 24.2781 9.63881 24.2469 9.88394 24.2174L9.90481 24.2149C10.2497 24.1733 10.6106 24.1304 10.9843 24.1304C11.6663 24.1304 12.1035 24.4153 12.7894 24.8837L12.794 24.8869C13.0316 25.0492 13.2976 25.2308 13.6 25.4095C14.6122 26.0076 15.4346 26.0025 15.9007 25.9995C15.9315 25.9993 15.9606 25.9992 15.9882 25.9992C16.0158 25.9992 16.0452 25.9993 16.0761 25.9995C16.543 26.0025 17.3873 26.0079 18.4 25.4095C18.7024 25.2308 18.9684 25.0492 19.2059 24.8869L19.2106 24.8837C19.8965 24.4153 20.3337 24.1304 21.0157 24.1304C21.3894 24.1304 21.7503 24.1733 22.0952 24.2149L22.1161 24.2174C22.3612 24.2469 22.6195 24.2781 22.8408 24.279C23.0469 24.2798 23.3628 24.2593 23.6044 24.0568C23.794 23.8977 23.8866 23.6744 23.9378 23.5234C23.992 23.3634 24.0288 23.1898 24.0566 23.0587L24.0589 23.0478C24.066 23.0142 24.0725 22.9836 24.0788 22.9551C24.5202 22.8972 24.9732 22.8007 25.3784 22.6712C25.8499 22.5205 26.3357 22.3007 26.6291 21.985L26.6439 21.9692L26.6517 21.9608C26.7051 21.9038 26.7978 21.8047 26.8699 21.6742C26.9523 21.5251 27 21.3532 27 21.1502C27 20.7612 26.7462 20.5146 26.5645 20.3923C26.4694 20.3283 26.3734 20.2829 26.2929 20.2527C26.2523 20.2374 26.2112 20.2243 26.1715 20.2144C26.1433 20.2073 26.0786 20.192 26.0039 20.192C25.9095 20.192 25.7568 20.1633 25.5483 20.0881C25.3464 20.0152 25.1207 19.9091 24.8898 19.7811C24.4244 19.5229 23.9792 19.1986 23.7079 18.9376C23.4328 18.673 23.0646 18.2161 22.7629 17.7706C22.6133 17.5498 22.4876 17.3427 22.4014 17.1743C22.3582 17.0899 22.3286 17.0224 22.3108 16.9724C22.3022 16.9482 22.2982 16.9333 22.2965 16.9264C22.299 16.8778 22.3186 16.8267 22.4483 16.7458C22.6149 16.642 22.8565 16.5596 23.1862 16.4514L23.2166 16.4415C23.5246 16.3406 23.9137 16.2131 24.2222 16.0135C24.5696 15.7888 24.8667 15.4384 24.8667 14.9105C24.8667 14.4885 24.6269 14.1394 24.3462 13.9124C24.0639 13.6839 23.6835 13.5298 23.2902 13.5298C22.9008 13.5298 22.6209 13.6643 22.4367 13.7527L22.4223 13.7596C22.3181 13.8095 22.2524 13.8386 22.199 13.8541C22.2443 13.2075 22.2962 12.3294 22.2962 11.6738C22.2962 10.7837 21.9726 9.37904 21.0255 8.18551ZM11.7832 8.77274C10.9822 9.77549 10.7077 10.9662 10.7077 11.6738C10.7077 12.3299 10.7633 13.2413 10.8102 13.8949C10.8258 14.1119 10.7813 14.365 10.5917 14.5658C10.3998 14.7691 10.1388 14.8351 9.90561 14.8351C9.56889 14.8351 9.3128 14.7119 9.14898 14.6331L9.12996 14.624C8.94718 14.5363 8.85108 14.4956 8.7098 14.4956C8.58128 14.4956 8.42437 14.5508 8.29994 14.6515C8.17382 14.7535 8.13725 14.8534 8.13725 14.9105C8.13725 15.0269 8.18018 15.1101 8.33794 15.2121C8.52427 15.3326 8.78976 15.4232 9.13779 15.5374L9.16809 15.5473C9.45712 15.642 9.81511 15.7593 10.0976 15.9354C10.4147 16.133 10.7077 16.4507 10.7077 16.9401C10.7077 17.0684 10.6722 17.1919 10.6389 17.2854C10.6028 17.3869 10.554 17.4941 10.4992 17.601C10.3896 17.8152 10.2413 18.0571 10.0783 18.2978C9.75483 18.7754 9.3437 19.2918 9.002 19.6205C8.65655 19.9528 8.13703 20.3263 7.61159 20.6178C7.34696 20.7645 7.07068 20.8961 6.80428 20.9923C6.56581 21.0783 6.3088 21.1457 6.06224 21.1563C6.0561 21.1589 6.04931 21.162 6.0422 21.1655C6.03083 21.1713 6.0202 21.1774 6.01092 21.1837L6.00618 21.187C6.00711 21.1936 6.00817 21.1985 6.00906 21.202C6.01103 21.2097 6.01337 21.2152 6.01652 21.2209C6.02619 21.2384 6.04143 21.2579 6.1031 21.324L6.11928 21.3413C6.23038 21.4609 6.50416 21.616 6.93815 21.7547C7.35148 21.8868 7.84023 21.9822 8.30201 22.026C8.53305 22.0479 8.66621 22.1923 8.72257 22.2701C8.78059 22.3501 8.81377 22.4347 8.83316 22.4908C8.87067 22.5994 8.899 22.7332 8.92135 22.8387L8.92474 22.8547C8.95525 22.9985 8.98194 23.1215 9.01675 23.2242C9.02905 23.2606 9.0404 23.2882 9.05017 23.3085C9.0722 23.3111 9.10599 23.3135 9.15493 23.3133C9.36726 23.3124 9.57984 23.2808 9.79022 23.2554C10.1268 23.2148 10.5433 23.1646 10.9843 23.1646C12.0071 23.1646 12.682 23.6258 13.334 24.0713L13.3706 24.0963C13.6118 24.261 13.8536 24.4259 14.1255 24.5866C14.8917 25.0394 15.4747 25.0361 15.9007 25.0337C15.9306 25.0336 15.9598 25.0334 15.9882 25.0334C16.0164 25.0334 16.0454 25.0336 16.0753 25.0337C16.5059 25.036 17.1085 25.0393 17.8745 24.5866C18.1464 24.4259 18.3882 24.261 18.6294 24.0963L18.666 24.0713C19.318 23.6258 19.9929 23.1646 21.0157 23.1646C21.4567 23.1646 21.8732 23.2148 22.2098 23.2554L22.2199 23.2566C22.4921 23.2894 22.6913 23.3126 22.8451 23.3133C22.894 23.3135 22.9278 23.3111 22.9498 23.3085C22.9596 23.2882 22.9709 23.2606 22.9833 23.2242C23.0181 23.1215 23.0447 22.9985 23.0753 22.8547L23.0787 22.8387C23.101 22.7331 23.1293 22.5994 23.1668 22.4908C23.1862 22.4347 23.2194 22.3501 23.2774 22.2701C23.3338 22.1923 23.467 22.0479 23.698 22.026C24.1598 21.9822 24.6485 21.8868 25.0618 21.7547C25.4958 21.616 25.7696 21.4609 25.8807 21.3414L25.8969 21.324C25.9585 21.2579 25.9738 21.2384 25.9835 21.2209C25.9866 21.2152 25.989 21.2097 25.9909 21.202C25.9918 21.1985 25.9929 21.1936 25.9938 21.187L25.9891 21.1837C25.9798 21.1774 25.9692 21.1713 25.9578 21.1655C25.9507 21.1619 25.9439 21.1589 25.9378 21.1563C25.6912 21.1457 25.4342 21.0783 25.1957 20.9923C24.9293 20.8961 24.653 20.7645 24.3884 20.6178C23.863 20.3263 23.3435 19.9528 22.998 19.6205C22.6563 19.2918 22.2452 18.7754 21.9217 18.2978C21.7587 18.0571 21.6104 17.8152 21.5008 17.601C21.446 17.4941 21.3972 17.3869 21.3611 17.2854C21.3278 17.1919 21.2923 17.0684 21.2923 16.9401C21.2923 16.4507 21.5853 16.133 21.9024 15.9354C22.1849 15.7593 22.5429 15.642 22.8319 15.5473L22.8622 15.5374C23.2102 15.4232 23.4757 15.3326 23.6621 15.2121C23.8198 15.1101 23.8627 15.0269 23.8627 14.9105C23.8627 14.8534 23.8262 14.7535 23.7001 14.6515C23.5756 14.5508 23.4187 14.4956 23.2902 14.4956C23.1489 14.4956 23.0528 14.5363 22.87 14.624L22.851 14.6331C22.6872 14.7119 22.4311 14.8351 22.0944 14.8351C21.8612 14.8351 21.6002 14.7691 21.4083 14.5658C21.2187 14.365 21.1742 14.1119 21.1898 13.8949C21.2367 13.2413 21.2923 12.3299 21.2923 11.6738C21.2923 10.9643 21.0227 9.77352 20.2275 8.77149C19.4508 7.79264 18.1523 6.96575 16.0118 6.96575C13.871 6.96575 12.566 7.79288 11.7832 8.77274Z" fill="#000000"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M11.7829 8.77281C10.9818 9.77556 10.7074 10.9662 10.7074 11.6738C10.7074 12.3299 10.763 13.2414 10.8099 13.895C10.8254 14.112 10.7809 14.365 10.5914 14.5659C10.3995 14.7692 10.1385 14.8352 9.90529 14.8352C9.56858 14.8352 9.31249 14.712 9.14866 14.6332L9.12964 14.624C8.94686 14.5364 8.85077 14.4956 8.70949 14.4956C8.58097 14.4956 8.42405 14.5509 8.29963 14.6515C8.1735 14.7536 8.13694 14.8535 8.13694 14.9106C8.13694 15.027 8.17987 15.1101 8.33763 15.2122C8.52395 15.3327 8.78944 15.4233 9.13748 15.5374L9.16778 15.5474C9.4568 15.6421 9.81479 15.7593 10.0973 15.9354C10.4144 16.1331 10.7074 16.4508 10.7074 16.9402C10.7074 17.0685 10.6719 17.192 10.6386 17.2855C10.6025 17.387 10.5536 17.4942 10.4989 17.6011C10.3893 17.8153 10.241 18.0572 10.0779 18.2979C9.75451 18.7754 9.34339 19.2918 9.00168 19.6206C8.65623 19.9529 8.13672 20.3264 7.61127 20.6178C7.34664 20.7646 7.07037 20.8962 6.80396 20.9923C6.56549 21.0784 6.30848 21.1458 6.06192 21.1563C6.05578 21.1589 6.04899 21.162 6.04188 21.1656C6.03051 21.1713 6.01988 21.1775 6.01061 21.1837L6.00586 21.187C6.00679 21.1937 6.00785 21.1986 6.00874 21.2021C6.01071 21.2098 6.01305 21.2153 6.01621 21.221C6.02587 21.2385 6.04112 21.258 6.10279 21.3241L6.11897 21.3414C6.23006 21.4609 6.50385 21.616 6.93783 21.7548C7.35116 21.8869 7.83992 21.9823 8.30169 22.0261C8.53273 22.048 8.6659 22.1924 8.72226 22.2701C8.78027 22.3502 8.81345 22.4348 8.83284 22.4909C8.87035 22.5995 8.89868 22.7332 8.92103 22.8387L8.92443 22.8548C8.95494 22.9986 8.98162 23.1215 9.01643 23.2243C9.02873 23.2606 9.04009 23.2883 9.04986 23.3086C9.07189 23.3111 9.10567 23.3135 9.15461 23.3133C9.36694 23.3125 9.57952 23.2808 9.7899 23.2555C10.1265 23.2149 10.543 23.1647 10.984 23.1647C12.0068 23.1647 12.6817 23.6259 13.3336 24.0713L13.3702 24.0963C13.6115 24.2611 13.8533 24.426 14.1252 24.5867C14.8914 25.0395 15.4744 25.0362 15.9003 25.0338C15.9303 25.0336 15.9595 25.0335 15.9879 25.0335C16.0161 25.0335 16.0451 25.0336 16.075 25.0338C16.5056 25.0361 17.1081 25.0394 17.8742 24.5867C18.1461 24.426 18.3879 24.2611 18.6291 24.0963L18.6657 24.0713C19.3177 23.6259 19.9926 23.1647 21.0154 23.1647C21.4564 23.1647 21.8729 23.2149 22.2095 23.2555L22.2196 23.2567C22.4918 23.2895 22.691 23.3127 22.8448 23.3133C22.8937 23.3135 22.9275 23.3111 22.9495 23.3086C22.9593 23.2883 22.9706 23.2606 22.9829 23.2243C23.0177 23.1215 23.0444 22.9986 23.0749 22.8548L23.0783 22.8387C23.1007 22.7332 23.129 22.5995 23.1665 22.4909C23.1859 22.4347 23.2191 22.3502 23.2771 22.2701C23.3335 22.1923 23.4666 22.048 23.6977 22.0261C24.1595 21.9823 24.6482 21.8869 25.0615 21.7548C25.4955 21.616 25.7693 21.461 25.8804 21.3414L25.8966 21.3241C25.9582 21.258 25.9735 21.2385 25.9832 21.221C25.9863 21.2153 25.9887 21.2098 25.9906 21.2021C25.9915 21.1986 25.9926 21.1937 25.9935 21.187L25.9888 21.1837C25.9795 21.1775 25.9689 21.1713 25.9575 21.1656C25.9504 21.162 25.9436 21.1589 25.9374 21.1563C25.6909 21.1458 25.4339 21.0784 25.1954 20.9923C24.929 20.8962 24.6527 20.7646 24.3881 20.6178C23.8626 20.3264 23.3431 19.9529 22.9977 19.6206C22.656 19.2918 22.2449 18.7754 21.9214 18.2979C21.7584 18.0572 21.6101 17.8153 21.5004 17.6011C21.4457 17.4942 21.3969 17.387 21.3607 17.2855C21.3275 17.192 21.292 17.0685 21.292 16.9402C21.292 16.4508 21.585 16.1331 21.9021 15.9354C22.1846 15.7593 22.5426 15.6421 22.8316 15.5474L22.8619 15.5374C23.2099 15.4233 23.4754 15.3327 23.6617 15.2122C23.8195 15.1101 23.8624 15.027 23.8624 14.9106C23.8624 14.8535 23.8259 14.7536 23.6997 14.6515C23.5753 14.5509 23.4184 14.4956 23.2899 14.4956C23.1486 14.4956 23.0525 14.5364 22.8697 14.624L22.8507 14.6332C22.6869 14.712 22.4308 14.8352 22.0941 14.8352C21.8609 14.8352 21.5999 14.7692 21.408 14.5659C21.2184 14.365 21.1739 14.112 21.1895 13.895C21.2364 13.2414 21.292 12.3299 21.292 11.6738C21.292 10.9644 21.0224 9.7736 20.2272 8.77157C19.4505 7.79271 18.152 6.96582 16.0114 6.96582C13.8706 6.96582 12.5657 7.79296 11.7829 8.77281Z" fill="white"/>
                    </svg>
                    <span className="ml-2">سناب شات</span>
                  </a>
                )}
                {nursery.socialMedia.tiktok && (
                  <a href={nursery.socialMedia.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center text-black hover:text-gray-800">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                    <span className="ml-2">تيك توك</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Map */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-3xl font-bold text-green-800 mb-4">الموقع على الخريطة</h3>
            <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">
              <p className="text-gray-500">خريطة الموقع</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 text-white text-2xl z-10 bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setLightboxOpen(false)}
            >
              &times;
            </button>
            <button 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={prevImage}
            >
              ‹
            </button>
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={nextImage}
            >
              ›
            </button>
            <img 
              src={allImages[currentImageIndex]} 
              alt={`صورة ${currentImageIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
              onError={(e) => {
                e.target.src = defaultNurseryImage;
              }}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseryDetail;