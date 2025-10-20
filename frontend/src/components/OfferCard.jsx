// src/components/OfferCard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import defaultImage from '../assets/offer_default.png';

const OfferCard = ({ offer }) => {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);

  // ✅ Make sure offer.id exists
  if (!offer?.id) {
    console.error("Offer is missing id:", offer);
    return null;
  }

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    const monthMap = {
      'يناير': 0, 'فبراير': 1, 'مارس': 2, 'أبريل': 3,
      'مايو': 4, 'يونيو': 5, 'يوليو': 6, 'أغسطس': 7,
      'سبتمبر': 8, 'أكتوبر': 9, 'نوفمبر': 10, 'ديسمبر': 11
    };
    const match = dateStr.trim().match(/(\d+)\s+([^\s]+)\s+(\d{4})/);
    if (match) {
      const day = parseInt(match[1], 10);
      const monthName = match[2];
      const year = parseInt(match[3], 10);
      const month = monthMap[monthName];
      if (month !== undefined) {
        return new Date(year, month, day);
      }
    }
    return null;
  };

  const endDate = parseDate(offer.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const timeDiff = endDate ? endDate - today : NaN;
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  const getDaysLeftText = () => {
    if (!endDate) return 'تاريخ غير صالح';
    if (daysLeft < 0) return 'العرض منتهي';
    if (daysLeft === 0) return 'ينتهي اليوم';
    if (daysLeft === 1) return 'يبقى يوم واحد';
    if (daysLeft <= 7) return `يبقى ${daysLeft} أيام`;
    return 'متاح حاليًا';
  };

  const daysLeftColor = !endDate ? 'text-gray-600' :
                        daysLeft < 0 ? 'text-red-600' :
                        daysLeft <= 7 ? 'text-orange-600' :
                        'text-green-600';

  const showDiscount = offer.discount !== null && offer.discount > 0;

  // Handle view details button
  const handleViewDetails = () => {
    navigate(`/offers/${offer.id}`);
  };

  // Handle share button - Show modal directly
  const handleShare = () => {
    setShowShareModal(true);
  };

  // Handle copy link
  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/offers/${offer.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('✅ تم نسخ الرابط بنجاح!');
      setShowShareModal(false);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('✅ تم نسخ الرابط بنجاح!');
        setShowShareModal(false);
      } catch (err2) {
        alert('❌ فشل نسخ الرابط. يرجى نسخه يدوياً: ' + shareUrl);
      }
      document.body.removeChild(textArea);
    }
  };

  // Handle social share
  const handleSocialShare = (platform) => {
    const shareUrl = `${window.location.origin}/offers/${offer.id}`;
    const shareText = encodeURIComponent(`${offer.title} - ${offer.nurseryName || 'عرض خاص'} على منصة مشاتل`);
  
    let url = '';
    switch(platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't support link sharing → open profile or copy link
        alert('📸 إنستغرام لا يدعم مشاركة الروابط مباشرة. يُرجى نسخ الرابط يدويًا.');
        return;
      case 'snapchat':
        url = `https://www.snapchat.com/scan?link=${encodeURIComponent(shareUrl)}`;
        break;
      case 'tiktok':
        url = `https://www.tiktok.com/share?url=${encodeURIComponent(shareUrl)}&text=${shareText}`;
        break;
      default:
        return;
    }
  
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareModal(false);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showShareModal) {
      // Save current overflow and padding
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      // Optional: prevent layout shift by compensating scrollbar width
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      // Restore
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [showShareModal]);

  return (
    <>
      <div className="w-full sm:max-w-xs mx-auto h-full">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
          {/* Image Container with Discount Badge */}
          <div className="relative h-48 bg-orange-50 flex items-center justify-center flex-shrink-0">
            <img
              src={offer.image || defaultImage}
              alt={offer.title}
              className="h-full w-full object-cover"
              onError={(e) => { e.target.src = defaultImage; }}
            />
            
            {/* Discount Badge - Positioned on top of image */}
            {showDiscount && (
              <div className="absolute top-3 right-3 z-10">
                <span className="bg-red-500/90 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                  خصم {offer.discount}%
                </span>
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col flex-grow">
            {/* Title - Fixed height */}
            <h3 className="text-xl font-bold text-green-800 mb-3 line-clamp-3 h-[4.5rem] flex items-center justify-center leading-tight">
              {offer.title}
            </h3>

            {/* 🔗 Clickable Nursery Name - Fixed height */}
            <p className="text-sm text-gray-600 mb-2 h-[1.5rem] flex items-center">
              <strong>من:</strong>{' '}
              {offer.nurseryId ? (
                <Link
                  to={`/nurseries/${offer.nurseryId}`}
                  className="text-green-600 hover:underline font-medium mr-1"
                >
                  {offer.nurseryName || 'عرض خاص'}
                </Link>
              ) : (
                <span className="mr-1">{offer.nurseryName || 'مشتل غير معروف'}</span>
              )}
            </p>

            {/* Nursery Location - Fixed height */}
            <div className="text-sm text-gray-600 mb-3 flex items-center h-[1.5rem]">
              <span className="ml-1">📍</span>
              <span className="line-clamp-1">{offer.nurseryLocation || 'غير محدد'}</span>
            </div>

            {/* Description - Fixed height */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-[2.5rem]">
              {offer.description || 'لا يوجد وصف متاح'}
            </p>

            {/* Days Left - Fixed height */}
            <div className="flex justify-between items-center text-sm mb-4 h-[2.5rem]">
              <span className="bg-red-500/80 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                ⏰ باقي {daysLeft < 0 ? 'منتهي' : `${daysLeft} يومًا`}
              </span>
              <span className={`font-medium text-xs ${daysLeftColor}`}>
                {getDaysLeftText()}
              </span>
            </div>

            {/* Action Buttons - Push to bottom with fixed height */}
            <div className="flex gap-2 mt-auto h-[2.5rem]">
              <button
                onClick={handleViewDetails}
                className="flex-1 bg-yellow-600/70 hover:bg-yellow-600/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center"
              >
                📜 عرض التفاصيل
              </button>
              <button
                onClick={handleShare}
                className="bg-green-600/80 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center"
              >
                📤 مشاركة
              </button>
            </div>
          </div>

          {offer.highlighted && (
            <div className="bg-yellow-600/80 p-2 text-center flex-shrink-0 h-[2.5rem] flex items-center justify-center">
              <span className="text-white text-sm font-bold">عرض خاص</span>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal - Compact Version */}
      {showShareModal && (
        <div 
          className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="bg-white rounded-xl p-4 w-[280px] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-green-800">مشاركة العرض</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              {/* WhatsApp */}
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="flex flex-col items-center p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs"
              >
                <span className="text-xl mb-1">📱</span>
                واتساب
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex flex-col items-center p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs"
              >
                <span className="text-xl mb-1">👥</span>
                فيسبوك
              </button>

              {/* Twitter */}
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex flex-col items-center p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs"
              >
                <span className="text-xl mb-1">🐦</span>
                تويتر
              </button>

              {/* Instagram */}
              <button
                onClick={() => handleSocialShare('instagram')}
                className="flex flex-col items-center p-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs"
              >
                <span className="text-xl mb-1">📸</span>
                إنستغرام
              </button>

              {/* Snapchat */}
              <button
                onClick={() => handleSocialShare('snapchat')}
                className="flex flex-col items-center p-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg text-xs"
              >
                <span className="text-xl mb-1">👻</span>
                سناب شات
              </button>

              {/* TikTok */}
              <button
                onClick={() => handleSocialShare('tiktok')}
                className="flex flex-col items-center p-2 bg-black hover:bg-gray-800 text-white rounded-lg text-xs"
              >
                <span className="text-xl mb-1">🎵</span>
                تيك توك
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs"
              >
                <span className="text-2xl mb-1">📋</span>
                نسخ الرابط
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OfferCard;