// src/pages/NurseryDetail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import defaultNurseryImage from '../assets/nurs_empty.png';

const NurseryDetail = () => {
  const { id } = useParams();
  const [nursery, setNursery] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch nursery
  useEffect(() => {
    const fetchNursery = async () => {
      try {
        const API_BASE = 'https://react-firebase-plant-nursery-production.up.railway.app';
        const response = await fetch(`${API_BASE}/api/nurseries/${id}`);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        setNursery(data);
      } catch (err) {
        console.error('Error fetching nursery:', err);
        setNursery(null);
      }
    };

    // ✅ Fetch offers for this nursery
    const fetchOffers = async () => {
      try {
        const API_BASE = 'https://react-firebase-plant-nursery-production.up.railway.app';
        const response = await fetch(`${API_BASE}/api/offers`);
        if (!response.ok) throw new Error('Failed to fetch offers');
        
        const allOffers = await response.json();
        
        // Filter: only offers that belong to this nursery
        const nurseryOffers = allOffers.filter(offer => offer.nurseryId === id);
        setOffers(nurseryOffers);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setOffers([]);
      }
    };

    // Run both
    Promise.all([fetchNursery(), fetchOffers()]).finally(() => {
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;
  if (!nursery) return <div className="text-center py-8">المشتل غير موجود أو غير منشور</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Link to="/nurseries" className="text-green-600 hover:underline mb-4 inline-block">
            ← العودة إلى المشاتل
          </Link>

          <div className="max-w-4xl mx-auto">
            {/* Nursery Image */}
            <div className="bg-green-100 rounded-xl h-64 flex items-center justify-center mb-8">
              <img 
                src={nursery.image || defaultNurseryImage} 
                alt={nursery.name} 
                onError={(e) => {
                  e.target.src = defaultNurseryImage;
                }}
                className="w-250 h-64 object-fill round-full border rounded-md"
              />
            </div>
            
            {/* Nursery Info */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-green-800 mb-2">{nursery.name}</h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {nursery.categories.map((category, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                {/*
                <div className="flex space-x-4 mt-4 md:mt-0">
                  <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full transition-colors flex items-center">
                    اتصل الآن
                  </button>
                  <button className="bg-white border border-green-500 hover:bg-green-50 text-green-500 px-6 py-3 rounded-full transition-colors flex items-center">
                    واتساب
                  </button>
                </div>
                    */}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">ساعات العمل</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-green-800">9:00 ص - 9:00 م</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">ارقام التواصل</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.54 1.06l-1.519.76a11.042 11.042 0 006.105 6.105l.76-1.519a1 1 0 011.06-.54l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <p className="text-green-800">
                    {nursery.phones && nursery.phones.length > 0 
                      ? nursery.phones.join(', ') 
                      : '+966 55 123 4567'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">الموقع</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.707 12.707a1 1 0 00-1.414 0l-3.95 3.95a1 1 0 001.414 1.414l1.5-1.5a1 1 0 011.414 0l3.95 3.95a1 1 0 001.414-1.414l-1.5-1.5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5.437a2 2 0 01.586-1.414l5.414-5.414A2 2 0 0115.414 0H18a2 2 0 012 2v3.437a2 2 0 01-.586 1.414l-5.414 5.414A2 2 0 0112 10z" />
                    </svg>
                  </div>
                  <p className="text-green-800">{nursery.location}</p>
                </div>
              </div>

              {/* Services — Icons from NurseryCard, full titles preserved */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-green-800 mb-4">الخدمات المتاحة</h3>
                <div className="flex flex-wrap gap-4">
                  {nursery.services?.includes('consultation') && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-300 hover:bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                      <div className="p-1 bg-gray-100 rounded-full">
                        <img src="https://img.icons8.com/stickers/26/consultation.png" alt="استشارات" />
                      </div>
                      <span>استشارات</span>
                    </div>
                  )}

                  {nursery.services?.includes('delivery') && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-300 hover:bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                      <div className="p-1 bg-gray-100 rounded-full">
                        <img src="https://img.icons8.com/color/26/truck--v1.png" alt="توصيل" />
                      </div>
                      <span>توصيل</span>
                    </div>
                  )}

                  {nursery.services?.includes('installation') && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-300 hover:bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                      <div className="p-1 bg-gray-100 rounded-full">
                        <img src="https://img.icons8.com/offices/26/hand-planting.png" alt="تركيب" />
                      </div>
                      <span>تركيب</span>
                    </div>
                  )}

                  {nursery.services?.includes('maintenance') && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-300 hover:bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                      <div className="p-1 bg-gray-100 rounded-full">
                        <img src="https://img.icons8.com/office/26/maintenance.png" alt="صيانة" />
                      </div>
                      <span>صيانة</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ Current Offers for This Nursery */}
            <div className="bg-yellow-50 rounded-xl p-8 mt-8">
              <h3 className="text-xl font-bold text-green-800 mb-6">العروض الحالية 🎁</h3>
              
              {offers.length > 0 ? (
                <div className="space-y-6">
                  {offers.map((offer) => (
                    <div key={offer.id} className="bg-white p-6 rounded-lg shadow">
                      <h4 className="text-lg font-bold text-gray-800">{offer.title}</h4>
                      <p className="text-gray-700 mt-2">{offer.description}</p>
                      
                      {offer.discount && (
                        <div className="mt-3">
                          <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                            خصم {offer.discount}%
                          </span>
                        </div>
                      )}

                      <div className="mt-4 text-sm text-gray-600">
                        <strong>ينتهي في:</strong> {offer.endDate || 'غير محدد'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">لا توجد عروض حالية من هذا المشتل.</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
              <h3 className="text-xl font-bold text-green-800 mb-6">معلومات التواصل</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Phone Numbers */}
                {nursery.phones && nursery.phones.length > 0 && (
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.54 1.06l-1.519.76a11.042 11.042 0 006.105 6.105l.76-1.519a1 1 0 011.06-.54l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">أرقام الجوال</p>
                      <div className="space-y-1">
                        {nursery.phones.map((phone, index) => (
                          <p key={index} className="font-medium text-green-800">{phone}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {nursery.whatsapp && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h.01M12 16h.01M15 16h.01M8 18h.01M12 18h.01M16 18h.01M9 14h.01M12 14h.01M15 14h.01" />
                    </svg>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">واتساب</p>
                      <p className="font-medium text-green-800">{nursery.whatsapp}</p>
                    </div>
                  </div>
                )}

                {/* Email (Optional) */}
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p className="font-medium text-green-800">info@nursery.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            {/* 
            <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
              <h3 className="text-xl font-bold text-green-800 mb-6">الموقع على الخريطة</h3>
              <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">
                <p className="text-gray-500">خريطة الموقع</p>
              </div>
            </div>
              */}
            {/* Social Media Links */}
            {nursery.socialMedia && (
              <div className="bg-yellow-100/30 rounded-xl shadow-lg p-8 mt-8">
                <h4 className="text-xl font-bold text-green-800 mb-6">تابعنا على وسائل التواصل</h4>
                <div className="flex flex-wrap gap-4">
                  {nursery.socialMedia.instagram && (
                    <a
                      href={nursery.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-pink-600 hover:text-pink-800"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      <span className="mr-2">إنستغرام</span>
                    </a>
                  )}

                  {nursery.socialMedia.twitter && (
                    <a
                      href={nursery.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sky-500 hover:text-sky-700"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      <span className="mr-2">تويتر</span>
                    </a>
                  )}

                  {nursery.socialMedia.facebook && (
                    <a
                      href={nursery.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span className="mr-2">فيسبوك</span>
                    </a>
                  )}

                  {nursery.socialMedia.tiktok && (
                    <a
                      href={nursery.socialMedia.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-black hover:text-gray-800"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                      </svg>
                      <span className="mr-2">تيك توك</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NurseryDetail;