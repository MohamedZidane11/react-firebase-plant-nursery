// src/components/NurseryCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import defaultImage from '../assets/nurs_empty.png';

const NurseryCard = ({ nursery, offers = [] }) => {
  // ✅ Safety check
  if (!nursery?.id) {
    console.error("Nursery is missing ID:", nursery);
    return null;
  }

  // Helper function to check if offer is expired
  const isExpired = (endDateStr) => {
    if (!endDateStr) return false;
    const end = new Date(endDateStr);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return end < now;
  };

  // Get active discount for this nursery
  const getActiveDiscount = () => {
    const activeOffersWithDiscount = offers.filter(offer => 
      offer.nurseryId === nursery.id && 
      offer.published !== false && 
      !isExpired(offer.endDate) &&
      typeof offer.discount === 'number' && 
      offer.discount > 0
    );
    
    if (activeOffersWithDiscount.length > 0) {
      return Math.max(...activeOffersWithDiscount.map(offer => offer.discount));
    }
    return null;
  };

  const discount = getActiveDiscount();

  return (
    <div className="w-full sm:max-w-xs mx-auto h-full">
      <Link to={`/nurseries/${nursery.id}`} className="block h-full">
        <div className={`rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col ${nursery.featured ? 'border-2 border-orange-500' : ''}`}>
          {/* Image with Badges */}
          <div className="bg-green-100 relative h-48 flex-shrink-0">
            {/* Discount Badge */}
            <div className="absolute top-3 left-3 z-10">
              {discount && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                  خصم {discount}%
                </span>
              )}
            </div>

            {/* Featured Badge */}
            <div className="absolute top-3 right-3 z-10">
              {nursery.featured && (
                <div className="bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.12a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.12a1 1 0 00-1.175 0l-3.976 2.12c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.12c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>مميز</span>
                </div>
              )}
            </div>

            {/* Image */}
            <div className="flex justify-center h-full">
              <img
                src={nursery.image || defaultImage}
                alt={nursery.name}
                onError={(e) => { e.target.src = defaultImage; }}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 bg-white flex flex-col flex-grow">
            {/* Title - Fixed height with consistent line-height */}
            <h3 className="text-lg font-bold text-green-800 text-center mb-3 line-clamp-2 h-[3.5rem] flex items-center justify-center leading-tight">
              {nursery.name}
            </h3>

            {/* Categories - Fixed height */}
            <div className="flex flex-wrap gap-2 mb-3 justify-center h-[2.5rem] items-center overflow-hidden">
              {nursery.categories && nursery.categories.slice(0, 3).map((category, index) => (
                <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                  {category}
                </span>
              ))}
            </div>

            {/* Location - Fixed height */}
            <div className="text-center text-[14px] text-gray-600 mb-4 h-[2.5rem] line-clamp-1 flex items-center justify-center">
              📍 {nursery.location}
            </div>

            <hr className="my-4 bg-gray-200 border-0 h-px" />

            {/* Services Icons - Fixed height at bottom */}
            <div className="flex justify-center gap-3 mt-auto h-[5.5rem] items-center">
              {(!nursery.services || nursery.services.length === 0) ? (
                <div className="text-center text-xs text-gray-400">لا توجد خدمات</div>
              ) : (
                <>
                  {nursery.services.includes('consultation') && (
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-gray-100 rounded-full flex items-center justify-center w-10 h-10">
                        <img src='https://img.icons8.com/stickers/26/consultation.png' alt="استشارة" className="w-6 h-6" />
                      </div>
                      <span className="inline-flex items-center rounded-full bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 mt-1">
                        استشارة
                      </span>
                    </div>
                  )}

                  {nursery.services.includes('delivery') && (
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                        <img src='https://img.icons8.com/color/26/truck--v1.png' alt="توصيل" className="w-6 h-6" />
                      </div>
                      <span className="inline-flex items-center rounded-full bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-500 mt-1">
                        توصيل
                      </span>
                    </div>
                  )}

                  {nursery.services.includes('installation') && (
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                        <img src='https://img.icons8.com/offices/26/hand-planting.png' alt="تركيب" className="w-6 h-6" />
                      </div>
                      <span className="inline-flex items-center rounded-full bg-green-400/10 px-2 py-1 text-xs font-medium text-green-500 mt-1">
                        تركيب
                      </span>
                    </div>
                  )}

                  {nursery.services.includes('maintenance') && (
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                        <img src='https://img.icons8.com/office/26/maintenance.png' alt="صيانة" className="w-6 h-6" />
                      </div>
                      <span className="inline-flex items-center rounded-full bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 mt-1">
                        صيانة
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default NurseryCard;