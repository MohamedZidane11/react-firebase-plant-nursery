import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = 'http://localhost:5000/';

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">إدارة البانرات الرئيسية</h2>
        <Link
          to="/banners/add"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + إضافة بانر
        </Link>
      </div>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <div className="space-y-4">
          {banners.length === 0 ? (
            <p className="text-gray-500">لا توجد بانرات.</p>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="border p-4 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {banner.imageUrl ? (
                    <img
                      src={banner.imageUrl}
                      alt="Banner"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs">لا صورة</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">الموضع: {banner.position}</p>
                    <p className={`text-sm ${banner.active ? 'text-green-600' : 'text-red-600'}`}>
                      {banner.active ? 'مفعل' : 'معطل'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/banners/edit/${banner.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    تعديل
                  </Link>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BannerManager;