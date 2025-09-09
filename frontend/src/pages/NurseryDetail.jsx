// src/pages/NurseryDetail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const NurseryDetail = () => {
  const { id } = useParams();
  const [nursery, setNursery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNursery = async () => {
      try {
        const API_BASE = 'https://react-firebase-plant-nursery-production.up.railway.app'; // 🔁 Replace with your Railway URL
        const response = await fetch(`${API_BASE}/api/nurseries/${id}`);
        
        if (!response.ok) throw new Error('Not found');
        
        const data = await response.json();
        setNursery(data);
      } catch (err) {
        console.error('Error fetching nursery:', err);
        setNursery(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNursery();
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
                src={nursery.image} 
                alt={nursery.name} 
                className="w-32 h-32 object-contain"
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
                <div className="flex space-x-4 mt-4 md:mt-0">
                  <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full transition-colors flex items-center">
                    اتصل الآن
                  </button>
                  <button className="bg-white border border-green-500 hover:bg-green-50 text-green-500 px-6 py-3 rounded-full transition-colors flex items-center">
                    واتساب
                  </button>
                </div>
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
                    <span className="text-gray-600">رقم التواصل</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.54 1.06l-1.519.76a11.042 11.042 0 006.105 6.105l.76-1.519a1 1 0 011.06-.54l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <p className="text-green-800">+966 55 123 4567</p>
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

              {/* Services */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-green-800 mb-4">الخدمات المتاحة</h3>
                <div className="flex flex-wrap gap-4">
                  {nursery.services?.includes('consultation') && (
                    <button className="bg-green-50 border border-green-300 hover:bg-green-100 text-green-800 px-6 py-3 rounded-lg">
                      استشارات
                    </button>
                  )}
                  {nursery.services?.includes('delivery') && (
                    <button className="bg-green-50 border border-green-300 hover:bg-green-100 text-green-800 px-6 py-3 rounded-lg">
                      توصيل
                    </button>
                  )}
                  {nursery.services?.includes('installation') && (
                    <button className="bg-green-50 border border-green-300 hover:bg-green-100 text-green-800 px-6 py-3 rounded-lg">
                      تركيب وصيانة
                    </button>
                  )}
                  {nursery.services?.includes('maintenance') && (
                    <button className="bg-green-50 border border-green-300 hover:bg-green-100 text-green-800 px-6 py-3 rounded-lg">
                      ضمان نباتات
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Current Offers */}
            <div className="bg-yellow-50 rounded-xl p-8 mt-8">
              <h3 className="text-xl font-bold text-green-800 mb-6">العروض الحالية 🎁</h3>
              <p className="text-gray-600">يعرض العروض الخاصة بالمشتل حسب البيانات من لوحة التحكم.</p>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
              <h3 className="text-xl font-bold text-green-800 mb-6">معلومات التواصل</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p className="font-medium text-green-800">info@nursery.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h.01M12 16h.01M15 16h.01M8 18h.01M12 18h.01M16 18h.01M9 14h.01M12 14h.01M15 14h.01" />
                  </svg>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">واتساب</p>
                    <p className="font-medium text-green-800">+966 55 123 4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.54 1.06l-1.519.76a11.042 11.042 0 006.105 6.105l.76-1.519a1 1 0 011.06-.54l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">رقم الجوال</p>
                    <p className="font-medium text-green-800">+966 55 123 4567</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
              <h3 className="text-xl font-bold text-green-800 mb-6">الموقع على الخريطة</h3>
              <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">
                <p className="text-gray-500">خريطة الموقع</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NurseryDetail;