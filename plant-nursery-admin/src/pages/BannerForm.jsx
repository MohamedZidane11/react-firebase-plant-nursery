import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const BannerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE = 'https://nurseries.qvtest.com';

  const [formData, setFormData] = useState({
    image: null,
    imageUrl: '',
    position: '',
    active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch banner if editing
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      const fetchBanner = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/banners/${id}`);
          if (res.ok) {
            const data = await res.json();
            setFormData({
              image: null,
              imageUrl: data.imageUrl || '',
              position: data.position,
              active: data.active
            });
            setImagePreview(data.imageUrl || '');
          } else {
            toast.error('البانر غير موجود');
            navigate('/banners');
          }
        } catch (err) {
          toast.error('فشل تحميل البانر');
          navigate('/banners');
        }
      };
      fetchBanner();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData({ ...formData, image: file });
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, image: null, imageUrl: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const body = new FormData();
    if (imageFile) body.append('image', imageFile);
    body.append('position', formData.position);
    body.append('active', formData.active);

    try {
      const url = id ? `${API_BASE}/api/banners/${id}` : `${API_BASE}/api/banners`;
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, { method, body });
      if (res.ok) {
        toast.success(id ? 'تم تحديث البانر!' : 'تم إضافة البانر!');
        navigate('/banners');
      } else {
        const err = await res.json();
        toast.error(err.error || 'حدث خطأ');
      }
    } catch (err) {
      toast.error('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/banners')}
          className="mb-6 text-blue-700 hover:underline flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          العودة إلى قائمة البانرات
        </button>

        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {id ? 'تعديل بانر' : 'إضافة بانر جديد'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> صورة البانر (PNG/JPG/WEBP)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition">
                <div className="space-y-1 text-center">
                  <svg 
                    className="mx-auto h-12 w-12 text-gray-400" 
                    stroke="currentColor" 
                    fill="none" 
                    viewBox="0 0 48 48"
                  >
                    <path 
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label 
                      htmlFor="file-upload" 
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>رفع صورة</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp"
                        className="sr-only"
                        onChange={handleImageChange}
                        required={!id && !imagePreview}
                      />
                    </label>
                    <p className="pl-1">أو اسحب الملف هنا</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP حتى 10MB</p>
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4 flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="معاينة البانر"
                      className="max-w-md w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                    />
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                      <span className="text-xs text-gray-600 px-2">معاينة</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    حذف الصورة
                  </button>
                  {formData.imageUrl && !imageFile && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      الصورة الحالية (سيتم استبدالها إذا رفعت واحدة جديدة)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> رقم الترتيب
              </label>
              <input
                type="number"
                name="position"
                value={formData.position}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="مثال: 1 (يحدد موضع البانر في السلايدر)"
              />
              <p className="mt-1 text-sm text-gray-500">الأرقام الأقل تظهر أولاً في السلايدر</p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center bg-gray-50 p-4 rounded-lg">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                id="active"
              />
              <label htmlFor="active" className="mr-3 flex items-center cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-gray-900">مفعل</span>
                  <p className="text-xs text-gray-500">يظهر في السلايدر الرئيسي للموقع</p>
                </div>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="submit"
                disabled={loading || (!imageFile && !formData.imageUrl)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {id ? 'تحديث البانر' : 'حفظ البانر'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/banners')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BannerForm;