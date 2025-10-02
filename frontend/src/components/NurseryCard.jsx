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
  // Find active offers for this nursery that have a valid discount > 0
  const activeOffersWithDiscount = offers.filter(offer => 
    offer.nurseryId === nursery.id && 
    offer.published !== false && 
    !isExpired(offer.endDate) &&
    typeof offer.discount === 'number' && 
    offer.discount > 0 // Only consider discounts greater than 0
  );
  
  // Return the highest discount if multiple offers exist
  if (activeOffersWithDiscount.length > 0) {
    return Math.max(...activeOffersWithDiscount.map(offer => offer.discount));
  }
  return null; // No valid discount found
};

const discount = getActiveDiscount();

  return (
    <div className="w-full sm:max-w-xs mx-auto">
    <Link to={`/nurseries/${nursery.id}`} className="block">
      <div className={`rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${nursery.featured ? 'border-2 border-orange-500' : ''}`}>
        <div className="bg-green-100 relative">
          {/* Discount Badge */}
          <div className="absolute top-3 left-3">
            {discount && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                خصم {discount}%
              </span>
            )}
          </div>

          {/* Featured Badge */}
          <div className="absolute top-3 right-3">
            {nursery.featured && (
              <div className="bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.12a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.12a1 1 0 00-1.175 0l-3.976 2.12c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.12c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <div>مميز</div>
              </div>
            )}
          </div>

          {/* Image */}
          <div className="flex justify-center">
            <img
              src={nursery.image || defaultImage}
              alt={nursery.name}
              onError={(e) => { e.target.src = defaultImage; }}
              className="w-80 h-42 object-fill rounded-t"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-white">
          <h3 className="text-lg font-bold text-green-800 text-center mb-2">{nursery.name}</h3>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-3 justify-center">
            {nursery.categories.map((category, index) => (
              <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {category}
              </span>
            ))}
          </div>

          {/* Location */}
          <div className="text-center text-sm text-gray-600 mb-4">
          📍 {nursery.location}
          </div>

          <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-300" />

          {/* Services Icons */}
          <div className="flex justify-center space-x-4">
            {nursery.services.includes('consultation') && (
              <div>
                <div className="p-2 bg-gray-100 rounded-full flex items-center justify-center">
                  <img src='https://img.icons8.com/stickers/26/consultation.png' />
                </div>

                <div>
                  <span class="inline-flex items-center rounded-full bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 inset-ring inset-ring-blue-400/30">استشارة</span>
                </div>
              </div>
            )}

            {nursery.services.includes('delivery') && (
              <div>
                <div className="p-2 bg-gray-100 rounded-full">
                  <img src='https://img.icons8.com/color/26/truck--v1.png' />
                  </div>

                <div>
                  <span class="inline-flex items-center rounded-full bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-500 inset-ring inset-ring-yellow-400/20">توصيل</span>
                </div>
              </div>
            )}

            {nursery.services.includes('installation') && (
              <div>
                <div className="p-2 bg-gray-100 rounded-full">
                  <img src='https://img.icons8.com/offices/26/hand-planting.png' />
                </div>

                <div>
                  <span class="inline-flex items-center rounded-full bg-green-400/10 px-2 py-1 text-xs font-medium text-yellow-500 inset-ring inset-ring-yellow-400/20">تركيب</span>
                </div>
              </div>
            )}

            {nursery.services.includes('maintenance') && (
              <div>
                <div className="p-2 bg-gray-100 rounded-full">
                  <img src='https://img.icons8.com/office/26/maintenance.png' />
                </div>
                
                <div>
                  <span class="inline-flex items-center rounded-full bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 inset-ring inset-ring-red-400/20">صيانة</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
    </div>
  );
};

export default NurseryCard;