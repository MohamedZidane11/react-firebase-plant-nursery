// src/pages/OfferDetail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import defaultImage from '../assets/offer_default.png'; // 🌐 عرض

const OfferDetail = () => {
  const { id } = useParams(); // ✅ Get ID from URL
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      console.error("No offer ID in URL");
      setLoading(false);
      return;
    }

    const fetchOffer = async () => {
      try {
        const API_BASE = 'https://react-firebase-plant-nursery-production.up.railway.app';
        const response = await fetch(`${API_BASE}/api/offers/${id}`);
        
        if (!response.ok) {
          throw new Error('Not found');
        }

        const data = await response.json();
        setOffer(data);
      } catch (err) {
        console.error('Error fetching offer:', err);
        setOffer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;
  if (!offer) return <p className="text-center py-8">العرض غير موجود.</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Image */}
          <img
            src={offer.image || defaultImage}
            alt={offer.title}
            className="w-full h-64 object-cover"
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

            <div className="mb-6">
              <strong className="text-gray-700">من: </strong>
              <span className="text-green-800">{offer.nurseryName || 'مشتل غير معروف'}</span>
            </div>

            <div>
              <strong className="text-gray-700">ينتهي في: </strong>
              <span className="text-orange-600">{offer.endDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetail;