// src/pages/OfferDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // ✅ Add Link
import defaultImage from '../assets/offer_default.png';

const OfferDetail = () => {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);
  const [nursery, setNursery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const API_BASE = 'https://react-firebase-plant-nursery-production.up.railway.app';
        const response = await fetch(`${API_BASE}/api/offers/${id}`);

        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        setOffer(data);

        // ✅ Fetch nursery if offer has nurseryId
        if (data.nurseryId) {
          const nurseryRes = await fetch(`${API_BASE}/api/nurseries/${data.nurseryId}`);
          if (nurseryRes.ok) {
            const nurseryData = await nurseryRes.json();
            setNursery(nurseryData);
          }
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

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;
  if (!offer) return <p className="text-center py-8">العرض غير موجود.</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Offer Image */}
          <img
            src={offer.image || defaultImage}
            alt={offer.title}
            className="w-full h-64 object-cover"
            onError={(e) => { e.target.src = defaultImage; }}
          />

          {/* Content */}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-green-800 mb-4">{offer.title}</h1>
            <p className="text-gray-700 text-lg mb-6">{offer.description}</p>

            {offer.discount && (
              <div className="mb-6">
                <span className="bg-red-500 text-white text-xl font-bold px-6 py-3 rounded-full">
                  خصم {offer.discount}%
                </span>
              </div>
            )}

            {/* 🏷️ Nursery Name - Now Clickable */}
            <div className="mb-4">
              <strong className="text-gray-700">من: </strong>
              {offer.nurseryId ? (
                <Link
                  to={`/nurseries/${offer.nurseryId}`}
                  className="text-green-800 font-medium hover:underline transition"
                >
                  {offer.nurseryName || (nursery ? nursery.name : 'مشتل غير معروف')}
                </Link>
              ) : (
                <span className="text-green-800 font-medium">
                  {offer.nurseryName || (nursery ? nursery.name : 'مشتل غير معروف')}
                </span>
              )}
            </div>

            {/* 📍 الموقع */}
            {nursery?.location && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-2">الموقع</h3>
                <div className="flex items-center text-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.707 12.707a1 1 0 00-1.414 0l-3.95 3.95a1 1 0 001.414 1.414l1.5-1.5a1 1 0 011.414 0l3.95 3.95a1 1 0 001.414-1.414l-1.5-1.5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5.437a2 2 0 01.586-1.414l5.414-5.414A2 2 0 0115.414 0H18a2 2 0 012 2v3.437a2 2 0 01-.586 1.414l-5.414 5.414A2 2 0 0112 10z" />
                  </svg>
                  <span>{nursery.location}</span>
                </div>
              </div>
            )}

            {/* 📞 رقم التواصل */}
            {(nursery?.whatsapp || nursery?.phone) && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-2">رقم التواصل</h3>
                <div className="flex items-center text-green-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.54 1.06l-1.519.76a11.042 11.042 0 006.105 6.105l.76-1.519a1 1 0 011.06-.54l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-medium">{nursery.whatsapp || nursery.phone}</span>
                </div>
              </div>
            )}

            {/* End Date */}
            <div className="mt-6 text-gray-600">
              <strong>ينتهي في: </strong>
              <span className="text-orange-600">{offer.endDate || 'غير محدد'}</span>
            </div>

            {/* Back Button */}
            <div className="mt-8">
              <Link to="/offers" className="text-green-600 hover:underline">
                ← العودة إلى العروض
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetail;