// src/components/OfferCard.jsx
import React from 'react';

const OfferCard = ({ offer }) => {
  // ✅ Universal date parser
  const parseDate = (dateStr) => {
    if (!dateStr) return null;

    // Handle "2025-11-15"
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    // Handle Arabic: "15 نوفمبر 2025"
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

  // ✅ Parse endDate
  const endDate = parseDate(offer.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const timeDiff = endDate ? endDate - today : NaN;
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // ✅ Human-readable text
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
    <div className="bg-orange-50 rounded-xl shadow-lg overflow-hidden mb-6">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-green-800">{offer.title}</h3>
            <p className="text-gray-700 mt-2">{offer.description}</p>
          </div>

          {showDiscount && (
            <div className="relative">
              <div className="absolute top-0 -left-1 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                خصم {offer.discount}%
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {offer.tags.map((tag, index) => (
            <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className={`font-medium ${daysLeftColor}`}>
            {getDaysLeftText()}
          </span>
          <span className="flex items-center text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{!endDate ? 'خطأ' : daysLeft < 0 ? 'منتهي' : `${daysLeft} يومًا`}</span>
          </span>
        </div>
      </div>

      {offer.highlighted && (
        <div className="bg-orange-500 p-4 text-center">
          <span className="text-white font-bold">عرض خاص</span>
        </div>
      )}
    </div>
  );
};

export default OfferCard;