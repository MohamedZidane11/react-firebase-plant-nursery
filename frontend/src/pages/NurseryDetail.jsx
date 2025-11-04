// src/pages/NurseryDetail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import defaultNurseryImage from '../assets/nurs_empty.png';

const API_BASE = 'https://nurseries.qvtest.com'; // => https://nurseries.qvtest.com http://localhost:5000

const NurseryDetail = () => {
  const { id } = useParams();
  const [nursery, setNursery] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(defaultNurseryImage);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const fetchNursery = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/nurseries/${id}`);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        setNursery(data);
        setMainImage(data.image || defaultNurseryImage);
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

  // ✅ Loading Animation
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );

  if (!nursery) return <div className="text-center py-8">المشتل غير موجود أو غير منشور</div>;

  const formatPhone = (phone) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10 && digits.startsWith('5')) {
      return `+966 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    }
    return phone;
  };

  const checkIfOpen = () => {
    if (!nursery.workingHours) {
      return { isOpen: null, message: 'غير محدد' };
    }
    const now = new Date();
    const currentDay = now.getDay(); // الأحد = 0, ..., الجمعة = 5
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const isFriday = currentDay === 5;
    const hours = isFriday ? nursery.workingHours.friday : nursery.workingHours.weekdays;
  
    if (!hours || !hours.open || !hours.close) {
      return { isOpen: null, message: 'غير محدد' };
    }
  
    // إذا كانت الساعة 00:00 فالمشتل مغلق
    if (hours.open === '00:00' || hours.close === '00:00') {
      return {
        isOpen: false,
        message: 'مغلق اليوم',
        nextChange: ''
      };
    }
  
    const [openHour, openMin] = hours.open.split(':').map(Number);
    const [closeHour, closeMin] = hours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
  
    const isOpen = currentTime >= openTime && currentTime < closeTime;
    return {
      isOpen,
      message: isOpen ? 'مفتوح الآن' : 'مغلق الآن',
      nextChange: isOpen ? `يغلق الساعة ${hours.close}` : `يفتح الساعة ${hours.open}`
    };
  };

  const openStatus = checkIfOpen();
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

  // ✅ FIXED: Build allImages safely
  const allImages = [];
  if (nursery.image && nursery.image !== defaultNurseryImage) {
    allImages.push(nursery.image);
  }
  if (nursery.album && Array.isArray(nursery.album)) {
    nursery.album.forEach(img => {
      if (img && typeof img === 'string' && img.trim() !== '') {
        allImages.push(img);
      }
    });
  }

  // Image Preview in main area
  const swapToAlbumImage = (clickedImageUrl) => {
    if (clickedImageUrl === mainImage) return;
  
    const currentMain = mainImage;
    setMainImage(clickedImageUrl);
  
    setNursery((prev) => {
      if (!prev) return prev;
  
      const existingAlbum = prev.album || [];
      const alreadyInAlbum = existingAlbum.includes(currentMain);
  
      let newAlbum = [...existingAlbum];
  
      if (!alreadyInAlbum && currentMain !== defaultNurseryImage) {
        newAlbum = [currentMain, ...existingAlbum];
      }
  
      return { ...prev, album: newAlbum };
    });
  };

  const addToBookmarks = () => {
    const pageTitle = `${nursery.name} - مشتل`;
    const pageUrl = window.location.href;
    if (window.sidebar && window.sidebar.addPanel) {
      window.sidebar.addPanel(pageTitle, pageUrl, '');
    } else if (window.external && ('AddFavorite' in window.external)) {
      window.external.AddFavorite(pageUrl, pageTitle);
    } else if (window.opera && window.print) {
      const elem = document.createElement('a');
      elem.setAttribute('href', pageUrl);
      elem.setAttribute('title', pageTitle);
      elem.setAttribute('rel', 'sidebar');
      elem.click();
    } else {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const shortcut = isMac ? 'Cmd+D' : 'Ctrl+D';
      alert(`لإضافة هذه الصفحة إلى المفضلة، اضغط ${shortcut} على لوحة المفاتيح`);
    }
  };

  const openWhatsApp = () => {
    const phone = nursery.phones?.[0] || '';
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappNumber = cleanPhone.startsWith('966') ? cleanPhone : `966${cleanPhone}`;
    const message = encodeURIComponent(`مرحباً، أنا مهتم بمشتل ${nursery.name}`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const makeCall = () => {
    const phone = nursery.phones?.[0] || '';
    window.location.href = `tel:${phone}`;
  };

  const openGoogleMaps = () => {
    if (nursery.googleMapsUrl) {
      window.open(nursery.googleMapsUrl, '_blank');
    }
  };

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
              <div className="relative w-full aspect-[4/3] max-h-[400px] mb-4">
                <img
                  src={mainImage}
                  alt={nursery.name}
                  onError={(e) => { e.target.src = defaultNurseryImage; }}
                  className="w-full h-full object-cover rounded-xl"
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
                  {nursery.album?.slice(0, 4).map((imageUrl, index) => (
                    <div 
                      key={index} 
                      className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => swapToAlbumImage(imageUrl)}
                    >
                      <img 
                        src={imageUrl} 
                        alt={`صورة ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = defaultNurseryImage; }}
                      />
                    </div>
                  ))}
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
              <h3 className="text-3xl font-bold text-green-800 mb-4 pb-4">🕐 ساعات العمل</h3>
              {nursery.workingHours ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>السبت - الخميس</span>
                    <span>{nursery.workingHours.weekdays?.open || '09:00'} - {nursery.workingHours.weekdays?.close || '21:00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الجمعة</span>
                    <span>{nursery.workingHours.friday?.open || '16:00'} - {nursery.workingHours.friday?.close || '22:00'}</span>
                  </div>
                </div>
              ) : (
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
              )}
              <div className="mt-6">
                {openStatus.isOpen === true ? (
                  <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700">
                    {openStatus.message} 🟢
                  </button>
                ) : openStatus.isOpen === false ? (
                  <button className="w-full bg-red-600 text-white py-3 rounded-lg font-medium">
                    {openStatus.message} 🔴
                  </button>
                ) : (
                  <button className="w-full bg-gray-400 text-white py-3 rounded-lg font-medium">
                    {openStatus.message}
                  </button>
                )}
                {openStatus.nextChange && (
                  <p className="text-sm text-gray-600 text-center mt-2">{openStatus.nextChange}</p>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-103 transition-all duration-500 ease-in-out transform hover:shadow-2xl">
              <h3 className="text-3xl font-bold text-green-800 mb-4 pb-4">ℹ️ معلومات التواصل</h3>
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
                      <span>لا يوجد</span>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="ml-4">
                    <strong className="block">📧 البريد الإلكتروني:</strong>
                    <span>{nursery.socialMedia?.email || 'لا يوجد'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Videos */}
          {nursery.videos && nursery.videos.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold text-green-800 mb-6">🎥 فيديوهات المشتل</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {nursery.videos.map((video, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="relative rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                      <video
                        controls
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        src={video}
                        onError={(e) => {
                          e.target.parentElement.style.display = 'none';
                        }}
                      >
                        متصفحك لا يدعم تشغيل الفيديو
                      </video>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offers */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-green-800 mb-6">🎁 العروض الحالية</h2>
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
                      <div className="text-sm text-red-700 font-bold mb-4">
                        <strong>⏰ ينتهي في:</strong> {offer.endDate || 'غير محدد'}
                      </div>
                      <Link
                        to={`/offers/${offer.id}`}
                        className="block w-full bg-gradient-to-r from-green-600 to-green-700 text-white text-center py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
                      >
                        📋 تفاصيل العرض
                      </Link>
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
                  <a href={nursery.socialMedia.snapchat} target="_blank" rel="noopener noreferrer" className="flex items-center text-yellow-500 hover:text-yellow-700">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.206 2.18c-1.14 0-2.072.904-2.072 2.014 0 .44.116.856.318 1.213a5.11 5.11 0 00-.525.118c-.258.07-.61.167-.943.167a.88.88 0 00-.885.876c0 .487.396.883.885.883.5 0 1.008-.172 1.513-.344.495-.168.99-.336 1.465-.336.22 0 .474.012.667.073.168.053.253.135.253.244 0 .08-.028.145-.168.234-.297.19-.66.284-1.07.36-.664.122-1.49.275-1.49 1.26 0 .384.106.753.315 1.096-.467.103-1.156.256-1.86.256-.885 0-1.755-.195-2.472-.553-.717-.358-1.247-.853-1.247-1.508 0-.308.125-.601.351-.826l.37-.367c.14-.138.327-.325.36-.615.034-.315-.128-.598-.354-.8-.226-.2-.565-.324-.935-.324-.28 0-.555.057-.813.168-.26.112-.48.27-.655.475-.175.203-.31.45-.408.732-.1.288-.15.598-.15.918 0 1.015.42 1.905 1.18 2.655.76.75 1.817 1.34 3.046 1.706.248.074.51.14.784.2-.11.33-.165.682-.165 1.046 0 .51.114 1.005.337 1.464a4.04 4.04 0 001.047 1.265c.453.388 1.018.695 1.656.9.638.206 1.36.31 2.115.31.756 0 1.477-.104 2.115-.31.638-.205 1.203-.512 1.657-.9a4.041 4.041 0 001.046-1.265 4.23 4.23 0 00.337-1.464c0-.364-.055-.716-.165-1.046.275-.06.536-.126.784-.2 1.23-.366 2.286-.956 3.046-1.707.76-.75 1.18-1.64 1.18-2.654 0-.32-.05-.63-.15-.918-.098-.282-.233-.53-.408-.732-.175-.204-.395-.363-.655-.475-.258-.111-.533-.168-.813-.168-.37 0-.71.123-.935.323-.226.202-.388.485-.354.8.033.29.22.477.36.616l.37.366c.226.225.351.518.351.826 0 .655-.53 1.15-1.247 1.508-.717.358-1.587.553-2.472.553-.704 0-1.393-.153-1.86-.256.209-.343.315-.712.315-1.096 0-.985-.826-1.138-1.49-1.26-.41-.076-.773-.17-1.07-.36-.14-.089-.168-.154-.168-.234 0-.109.085-.19.253-.244.193-.061.447-.073.667-.073.475 0 .97.168 1.465.336.505.172 1.013.344 1.513.344a.88.88 0 00.885-.883.88.88 0 00-.885-.876c-.333 0-.685-.097-.943-.167a5.11 5.11 0 00-.525-.118c.202-.357.318-.773.318-1.213 0-1.11-.932-2.014-2.072-2.014z"/>
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

          {/* Google Maps */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-3xl font-bold text-green-800">🗺️ الموقع على الخريطة</h3>
              {nursery.googleMapsUrl && (
                <button
                  onClick={openGoogleMaps}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  فتح في خرائط جوجل
                </button>
              )}
            </div>
            
            {nursery.googleMapsEmbedUrl || nursery.googleMapsUrl ? (
              <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ height: '400px' }}>
                {!mapError ? (
                  <iframe
                    src={nursery.googleMapsEmbedUrl || nursery.googleMapsUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`موقع ${nursery.name} على خرائط جوجل`}
                    onError={() => setMapError(true)}
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-lg font-medium mb-2">تعذر تحميل الخريطة</p>
                    <p className="text-sm text-gray-500 mb-4">يمكنك فتح الموقع مباشرة في خرائط جوجل</p>
                    <button
                      onClick={openGoogleMaps}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      فتح في خرائط جوجل
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-200 h-64 flex flex-col items-center justify-center rounded-lg">
                <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500 text-lg">لم يتم إضافة رابط خريطة لهذا المشتل</p>
                <p className="text-gray-400 text-sm mt-2">الموقع: {region} - {city} - {district}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NurseryDetail;