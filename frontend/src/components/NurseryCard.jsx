// src/components/NurseryCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import defaultImage from '../assets/nurs_empty.png';

const NurseryCard = ({ nursery }) => {
  // ✅ Safety check
  if (!nursery?.id) {
    console.error("Nursery is missing ID:", nursery);
    return null;
  }

  return (
    <div className="w-full sm:max-w-xs mx-auto">
    <Link to={`/nurseries/${nursery.id}`} className="block">
      <div className={`rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${nursery.featured ? 'border-2 border-orange-500' : ''}`}>
        <div className="bg-green-100 p-6 relative">
          {/* Discount Badge */}
          <div className="absolute top-3 left-3">
            {nursery.discount && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                خصم {nursery.discount}%
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
              </div>
            )}
          </div>

          {/* Image */}
          <div className="flex justify-center">
            <img
              src={nursery.image || defaultImage}
              alt={nursery.name}
              onError={(e) => { e.target.src = defaultImage; }}
              className="w-32 h-32 object-contain"
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
                  {/*<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.338-3.12C2.493 15.042 2 13.574 2 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>*/}
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
                  {/*<svg width="20px" height="20px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <g id="Layer_2" data-name="Layer 2">
                      <g id="invisible_box" data-name="invisible box">
                        <rect width="48" height="48" fill="none"/>
                      </g>
                      <g id="Health_Icons" data-name="Health Icons">
                        <path d="M35.8,11a3.2,3.2,0,0,0-2.2-1H32V8a2.9,2.9,0,0,0-3-3H5A2.9,2.9,0,0,0,2,8V35a2.9,2.9,0,0,0,3,3H7.3a7,7,0,0,0,13.4,0h6.6a7,7,0,0,0,13.4,0H43a2.9,2.9,0,0,0,3-3V22.2Zm-2.7,3,7.3,8H32V14ZM6,9H28V32.4a7.7,7.7,0,0,0-.7,1.6H20.7A7,7,0,0,0,7.3,34H6Zm8,30a3,3,0,1,1,3-3A2.9,2.9,0,0,1,14,39Zm20,0a3,3,0,1,1,3-3A2.9,2.9,0,0,1,34,39Zm6.7-5A7,7,0,0,0,34,29a6.4,6.4,0,0,0-2,.3V26H42v8Z"/>
                      </g>
                    </g>
                  </svg>*/}
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
                
                  {/*<svg version="1.1" id="Uploaded to svgrepo.com" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20px" height="20px" viewBox="0 0 32 32" xml:space="preserve">
                    <path className="linesandangles_een" d="M28,17v-2H17v-2.052C23.289,12.418,25,6.96,25,4V3h-1c-4.416,0-6.814,2.266-8,4.729C14.814,5.266,12.416,3,8,3H7v1c0,2.96,1.711,8.418,8,8.948V15H4v2h11v3.285c-1.474,0.78-3,3.009-3,4.715c0,2.206,1.794,4,4,4s4-1.794,4-4c0-1.706-1.526-3.935-3-4.715V17H28z M22.898,5.062c-0.291,1.821-1.42,5.367-5.797,5.877C17.393,9.118,18.521,5.572,22.898,5.062z M9.101,5.062c4.377,0.51,5.507,4.056,5.798,5.877C10.521,10.428,9.392,6.881,9.101,5.062z M16,27c-1.103,0-2-0.897-2-2c0-1.124,1.484-2.873,1.953-3.004C16.516,22.127,18,23.876,18,25C18,26.103,17.103,27,16,27z"/>
                  </svg>*/}
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
                  {/*<svg width="20px" height="20px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                      <g id="Combined-Shape" fill="#000000" transform="translate(42.666667, 42.666667)">
                        <path d="M128,7.10542736e-15 C198.692448,7.10542736e-15 256,57.307552 256,128 C256,140.931179 254.082471,153.414494 250.516246,165.181113 L384,298.666667 C407.564149,322.230816 407.564149,360.435851 384,384 C360.435851,407.564149 322.230816,407.564149 298.666667,384 L165.181113,250.516246 C153.414494,254.082471 140.931179,256 128,256 C57.307552,256 7.10542736e-15,198.692448 7.10542736e-15,128 C7.10542736e-15,114.357909 2.13416363,101.214278 6.08683609,88.884763 L66.6347809,149.333333 L126.649,129.346 L129.329,126.666 L149.333333,66.7080586 L88.7145729,6.14152881 C101.0933,2.15385405 114.29512,7.10542736e-15 128,7.10542736e-15 Z"></path>
                      </g>
                    </g>
                  </svg>*/}
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