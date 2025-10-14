// src/components/OfferCard.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import defaultImage from '../assets/offer_default.png';

const OfferCard = ({ offer }) => {
  const navigate = useNavigate();

  // ✅ Make sure offer.id exists
  if (!offer?.id) {
    console.error("Offer is missing id:", offer);
    return null;
  }

  // Debug: Check if nurseryLocation exists
  console.log('Offer:', offer.id, '| nurseryLocation:', offer.nurseryLocation);

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

  // Handle share button
  const handleShare = async () => {
    const shareData = {
      title: offer.title,
      text: `تحقق من هذا العرض: ${offer.title}`,
      url: window.location.origin + `/offers/${offer.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        alert('تم نسخ الرابط!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="w-full sm:max-w-xs mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Image Container with Discount Badge */}
        <div className="relative h-40 bg-orange-50 flex items-center justify-center">
          <img
            src={offer.image || defaultImage}
            alt={offer.title}
            className="h-full w-full object-cover"
            onError={(e) => { e.target.src = defaultImage; }}
          />
          
          {/* Discount Badge - Positioned on top of image */}
          {showDiscount && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                خصم {offer.discount}%
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-green-800 mb-3">{offer.title}</h3>

          {/* 🔗 Clickable Nursery Name */}
          <p className="text-sm text-gray-600 mb-2">
            <strong>من:</strong>{' '}
            {offer.nurseryId ? (
              <Link
                to={`/nurseries/${offer.nurseryId}`}
                className="text-green-600 hover:underline font-medium"
              >
                {offer.nurseryName || 'عرض خاص'}
              </Link>
            ) : (
              <span>{offer.nurseryName || 'مشتل غير معروف'}</span>
            )}
          </p>

          {/* Nursery Location */}
          {offer.nurseryLocation && (
            <div className="text-sm text-gray-600 mb-3 flex items-center">
              <span className="ml-1">📍</span>
              <span>{offer.nurseryLocation}</span>
            </div>
          )}

          {/* Description */}
          {offer.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {offer.description}
            </p>
          )}

          {/* Days Left */}
          <div className="flex justify-between items-center text-sm mb-4">
            <span className={`font-medium ${daysLeftColor}`}>
              {getDaysLeftText()}
            </span>
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
              ⏰ باقي {daysLeft < 0 ? 'منتهي' : `${daysLeft} يومًا`}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleViewDetails}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              عرض التفاصيل
            </button>
            <button
              onClick={handleShare}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              مشاركة
            </button>
          </div>
        </div>

        {offer.highlighted && (
          <div className="bg-yellow-600/80 p-2 text-center">
            <span className="text-white text-sm font-bold">عرض خاص</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferCard;