// src/pages/OfferDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import defaultImage from '../assets/offer_default.png';

const OfferDetail = () => {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);
  const [nursery, setNursery] = useState(null);
  const [relatedOffers, setRelatedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(defaultImage);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const API_BASE = 'https://nurseries.qvtest.com';
        const response = await fetch(`${API_BASE}/api/offers/${id}`);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        setOffer(data);
        setMainImage(data.image || defaultImage);

        if (data.nurseryId) {
          const nurseryRes = await fetch(`${API_BASE}/api/nurseries/${data.nurseryId}`);
          if (nurseryRes.ok) {
            const nurseryData = await nurseryRes.json();
            setNursery(nurseryData);
          }
        }

        const offersRes = await fetch(`${API_BASE}/api/offers`);
        if (offersRes.ok) {
          const allOffers = await offersRes.json();
          const related = allOffers
            .filter(o => o.id !== id && o.nurseryId === data.nurseryId)
            .slice(0, 3);
          setRelatedOffers(related);
        }
      } catch (err) {
        console.error('Error fetching offer:', err);
        setOffer(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOffer();
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!offer?.endDate) return;
    const updateCountdown = () => {
      const endDate = new Date(offer.endDate + 'T23:59:59');
      const now = new Date();
      const difference = endDate - now;
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        let timerText = '';
        if (days > 0) timerText += `${days} ${days === 1 ? 'يوم' : 'أيام'} و `;
        if (hours > 0) timerText += `${hours} ساعة و `;
        if (minutes > 0) timerText += `${minutes} دقيقة`;
        setCountdown(timerText);
      } else {
        setCountdown('انتهى العرض');
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [offer]);

  // ✅ FIXED: Build displayThumbnails safely — include main image + album, no dupes
  const displayThumbnails = [];
  const seen = new Set();

  // Add main image (offer.image) if valid and not default
  if (offer?.image && offer.image !== defaultImage) {
    const url = offer.image;
    if (!seen.has(url)) {
      displayThumbnails.push(url);
      seen.add(url);
    }
  }

  // Add album images
  if (offer?.album && Array.isArray(offer.album)) {
    for (const img of offer.album) {
      if (img && typeof img === 'string' && img.trim() !== '' && !seen.has(img)) {
        displayThumbnails.push(img);
        seen.add(img);
      }
    }
  }

  const shareOffer = (platform) => {
    const url = window.location.href;
    const text = encodeURIComponent(`${offer.title} - عرض مميز من منصة المشاتل`);
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`, '_blank');
        break;
      case 'instagram':
        alert('📸 إنستغرام لا يدعم مشاركة الروابط مباشرة. يُرجى نسخ الرابط يدويًا.');
        break;
      case 'snapchat':
        window.open(`https://www.snapchat.com/scan?link=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'tiktok':
        window.open(`https://www.tiktok.com/share?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
        break;
    }
  };

  // ✅ Loading Animation
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );

  if (!offer) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">العرض غير موجود</h2>
        <Link to="/offers" className="text-green-600 hover:underline">← العودة إلى العروض</Link>
      </div>
    </div>
  );

  const discountBadge = offer.discount || 
    (offer.originalPrice && offer.finalPrice 
      ? Math.round(((offer.originalPrice - offer.finalPrice) / offer.originalPrice) * 100)
      : null);

  const nurseryPhone = offer.nurseryPhone || nursery?.phones?.[0] || '';
  const nurseryWhatsapp = offer.nurseryWhatsapp || nursery?.whatsapp || nursery?.phones?.[0] || '';

  // Handle thumbnail click: update main image, but DO NOT modify offer.album
  const handleThumbnailClick = (imageUrl) => {
    if (imageUrl === mainImage) return;
    setMainImage(imageUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-green-600">الرئيسية</Link>
            <span className="text-gray-400">›</span>
            <Link to="/offers" className="text-gray-600 hover:text-green-600">العروض</Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-800 font-semibold">{offer.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Gallery */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image + Thumbnails */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Main Image */}
              <div className="relative">
                <img
                  src={mainImage}
                  alt={offer.title}
                  className="w-full h-[500px] object-cover"
                  onError={(e) => (e.target.src = defaultImage)}
                />
                {discountBadge && (
                  <div className="absolute top-5 right-5 bg-red-500/90 text-white px-8 py-4 rounded-full font-black text-2xl shadow-lg flex items-center gap-2">
                    <span>{discountBadge}%</span>
                    <span>خصم</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {displayThumbnails.length > 0 && (
                <div className="flex justify-center gap-2 mt-4 p-6 bg-gray-50">
                  {displayThumbnails.map((imageUrl, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 shadow-md cursor-pointer hover:scale-105 transition-transform ${
                        mainImage === imageUrl
                          ? 'border-green-600 ring-2 ring-green-300'
                          : 'border-white'
                      }`}
                      onClick={() => handleThumbnailClick(imageUrl)}
                    >
                      <img
                        src={imageUrl}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.parentElement.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos */}
            {offer.videos && offer.videos.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🎥</span>
                  <span>فيديوهات توضيحية للعرض</span>
                </h3>
                <div className="space-y-4">
                  {offer.videos.map((video, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
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
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>📋</span>
                <span>تفاصيل العرض</span>
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">{offer.description}</p>
              {offer.features && offer.features.length > 0 && (
                <>
                  <h4 className="text-xl font-bold text-green-800 mb-4">مميزات العرض:</h4>
                  <ul className="space-y-3">
                    {offer.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <span className="text-green-600 text-xl font-bold mt-1">✓</span>
                        <span className="flex-1">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Offer Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h1 className="text-3xl font-black text-gray-800 mb-4 leading-tight">{offer.title}</h1>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center text-3xl text-white">
                  🌳
                </div>
                <div className="flex-1">
                  <Link
                    to={`/nurseries/${offer.nurseryId}`}
                    className="text-lg font-bold text-green-800 hover:underline"
                  >
                    {offer.nurseryName || 'مشتل غير معروف'}
                  </Link>
                  {offer.nurseryLocation && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span>📍</span>
                      <span>{offer.nurseryLocation}</span>
                    </div>
                  )}
                </div>
              </div>

              {countdown && countdown !== 'انتهى العرض' && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-r-4 border-orange-500 p-5 rounded-lg mb-6 flex items-center gap-4">
                  <div className="text-4xl">⏰</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">ينتهي العرض بعد:</p>
                    <p className="text-xl font-bold text-gray-800">{countdown}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                {offer.startDate && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">تاريخ البداية</p>
                    <p className="text-base font-semibold text-gray-800">{offer.startDate}</p>
                  </div>
                )}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">تاريخ الانتهاء</p>
                  <p className="text-base font-semibold text-gray-800">{offer.endDate || 'غير محدد'}</p>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              {discountBadge && (
                <div className="bg-gradient-to-r from-[#eeebd0] to-[#f3c677] text-gray-700 p-6 rounded-xl mb-6">
                  <div className="text-5xl font-black mb-2">{discountBadge}%</div>
                  <div className="text-lg font-semibold">{offer.title}</div>
                </div>
              )}
              {offer.originalPrice && (
                <p className="text-lg text-gray-500 line-through mb-2">
                  السعر الأصلي: {offer.originalPrice} ريال
                </p>
              )}
              {offer.finalPrice && (
                <p className="text-4xl font-black text-green-600 mb-2">
                  {offer.finalPrice} <span className="text-2xl">ريال</span>
                </p>
              )}
              {!offer.finalPrice && !offer.originalPrice && discountBadge && (
                <p className="text-xl font-bold text-green-600">وفر حتى {discountBadge}%</p>
              )}
            </div>

            {/* Contact Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-3">
                {nurseryPhone && (
                  <a
                    href={`tel:${nurseryPhone}`}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition"
                  >
                    <span>📞</span>
                    <span>اتصل الآن</span>
                  </a>
                )}
                {nurseryWhatsapp && (
                  <a
                    href={`https://wa.me/${nurseryWhatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition"
                  >
                    <span>💬</span>
                    <span>تواصل عبر واتساب</span>
                  </a>
                )}
                {offer.nurseryId && (
                  <Link
                    to={`/nurseries/${offer.nurseryId}`}
                    className="w-full flex items-center justify-center gap-3 border-2 border-green-600 text-green-600 px-6 py-4 rounded-lg font-bold text-lg hover:bg-green-50 transition"
                  >
                    <span>🌿</span>
                    <span>زيارة صفحة المشتل</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Share Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <h3 className="text-base font-semibold mb-4">شارك العرض مع أصدقائك</h3>
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  onClick={() => shareOffer('facebook')}
                  className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition"
                  aria-label="مشاركة على فيسبوك"
                >
                  f
                </button>
                <button
                  onClick={() => shareOffer('twitter')}
                  className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition"
                  aria-label="مشاركة على تويتر"
                >
                  𝕏
                </button>
                <button
                  onClick={() => shareOffer('whatsapp')}
                  className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition"
                  aria-label="مشاركة على واتساب"
                >
                  📱
                </button>
                <button
                  onClick={() => shareOffer('instagram')}
                  className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition"
                  aria-label="مشاركة على إنستغرام"
                >
                  📸
                </button>
                <button
                  onClick={() => shareOffer('snapchat')}
                  className="w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center hover:scale-110 transition"
                  aria-label="مشاركة على سناب شات"
                >
                  👻
                </button>
                <button
                  onClick={() => shareOffer('tiktok')}
                  className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition"
                  aria-label="مشاركة على تيك توك"
                >
                  🎵
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetail;