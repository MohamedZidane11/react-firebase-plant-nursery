import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = 'https://nurseries.qvtest.com';

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/banners`);
      const data = await res.json();
      setBanners(data.sort((a, b) => a.position - b.position));
    } catch (err) {
      toast.error('فشل تحميل البانرات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      const res = await fetch(`${API_BASE}/api/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('تم الحذف!');
        fetchBanners();
      } else {
        toast.error('فشل الحذف');
      }
    } catch {
      toast.error('فشل الاتصال');
    }
  };

  // ✅ Loading Animation
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#ffd6e0]/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#ff70a6]">إدارة البانرات الرئيسية</h1>
          <Link
            to="/banners/add"
            className="bg-[#ff70a6] hover:bg-[#FF4D6D] text-white px-6 py-3 rounded-lg font-medium transition"
          >
            + إضافة بانر جديد
          </Link>
        </div>

        {/* Banners List - Card View */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">البانرات ({banners.length})</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {banners.length === 0 ? (
              <p className="p-8 text-center text-gray-500">لا توجد بانرات.</p>
            ) : (
              banners.map((banner) => (
                <div 
                  key={banner.id} 
                  className="p-6 hover:bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Banner Info */}
                  <div>
                    <div className="flex items-center gap-4">
                      {/* Banner Image */}
                      {banner.imageUrl ? (
                        <img
                          src={banner.imageUrl}
                          alt="Banner"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300">
                          <span className="text-xs text-gray-500">لا توجد صورة</span>
                        </div>
                      )}

                      {/* Banner Details */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-800 text-lg">الموضع: {banner.position}</span>
                        </div>
                        
                        {banner.link && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">الرابط:</span> {banner.link}
                          </p>
                        )}
                        
                        {banner.title && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">العنوان:</span> {banner.title}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {banner.active ? (
                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                          مفعّل
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-semibold">
                          معطّل
                        </span>
                      )}
                      
                      <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                        ترتيب #{banner.position}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                    <Link
                      to={`/banners/edit/${banner.id}`}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm px-4 py-2 rounded transition font-medium"
                    >
                      تعديل
                    </Link>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-800 text-sm px-4 py-2 rounded transition font-medium"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerManager;