// src/components/OfferCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import defaultImage from '../assets/offer_default.png';

const OfferCard = ({ offer }) => {
  // ✅ Make sure offer._id exists
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

  return (
    <div className="w-full sm:max-w-xs mx-auto">
    <Link to={`/offers/${offer.id}`} className="block"> 
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="h-40 bg-orange-50 flex items-center justify-center">
          <img
            src={offer.image || defaultImage}
            alt={offer.title}
            className="h-full w-full object-cover"
            onError={(e) => { e.target.src = defaultImage; }}
          />
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-green-800 mb-2">{offer.title}</h3>
          <p className="text-sm text-gray-600 mb-3">
            <strong>من:</strong> {offer.nurseryName || 'مشتل غير معروف'}
          </p>

          {showDiscount && (
            <div className="mb-3">
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                خصم {offer.discount}%
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className={`font-medium ${daysLeftColor}`}>
              {getDaysLeftText()}
            </span>
            <span className="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{daysLeft < 0 ? 'منتهي' : `${daysLeft} يومًا`}</span>
            </span>
          </div>
        </div>

        {offer.highlighted && (
          <div className="bg-orange-500 p-2 text-center">
            <span className="text-white text-sm font-bold">عرض خاص</span>
          </div>
        )}
      </div>
    </Link>
    </div>
  );
};

export default OfferCard;