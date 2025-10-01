// src/pages/NurseryForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, storage } from '../firebase/firebase';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebase/firebase';

const NurseryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    categories: [],
    region: '',
    city: '',
    district: '',
    services: [],
    featured: false,
    published: true,
    phone: '',
    socialMedia: {
      instagram: '',
      twitter: '',
      facebook: '',
      tiktok: ''
    }
  });

  // Fetch locations + nursery (if editing)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch locations
        const locDoc = await getDoc(doc(db, 'locations', 'SA'));
        if (locDoc.exists()) {
          setLocations(locDoc.data().data || []);
        }

        // If editing, load nursery
        if (id) {
          const nurseryDoc = await getDoc(doc(db, 'nurseries', id));
          if (nurseryDoc.exists()) {
            const data = nurseryDoc.data();
            setFormData({
              name: data.name || '',
              image: data.image || '',
              categories: data.categories || [],
              region: data.region || '',
              city: data.city || '',
              district: data.district || '',
              services: data.services || [],
              featured: data.featured || false,
              published: data.published !== false,
              phone: data.phone || '',
              socialMedia: {
                instagram: data.socialMedia?.instagram || '',
                twitter: data.socialMedia?.twitter || '',
                facebook: data.socialMedia?.facebook || '',
                tiktok: data.socialMedia?.tiktok || ''
              }
            });
            setImagePreview(data.image || '');
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleServiceChange = (service) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.image;

    const storageRef = ref(storage, `nurseries/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.region || !formData.city || !formData.district) {
      alert('الاسم والمنطقة والمدينة والحي مطلوبة');
      return;
    }

    try {
      setLoading(true);
      const imageUrl = await uploadImage();

      const data = {
        ...formData,
        image: imageUrl,
        socialMedia: Object.fromEntries(
          Object.entries(formData.socialMedia).filter(([_, v]) => v.trim() !== '')
        ),
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.email
      };

      if (id) {
        await updateDoc(doc(db, 'nurseries', id), data);
        alert('تم التحديث!');
      } else {
        await addDoc(collection(db, 'nurseries'), {
          ...data,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.email
        });
        alert('تم الإضافة!');
      }

      navigate('/nurseries');
    } catch (err) {
      alert('خطأ: ' + err.message);
      console.error(err);
      setLoading(false);
    }
  };

  // Get cities & districts based on selection
  const cities = locations.find(loc => loc.region === formData.region)?.cities || [];
  const districts = cities.find(c => c.name === formData.city)?.districts || [];

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/nurseries')}
          className="mb-6 text-green-700 hover:underline"
        >
          ← العودة إلى قائمة المشاتل
        </button>

        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">
            {id ? 'تعديل مشتل' : 'إضافة مشتل جديد'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم المشتل</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                required
              />
            </div>

            {/* Image Upload - Enhanced UI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صورة المشتل</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
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
                      className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                    >
                      <span>رفع صورة</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">أو اسحب الملف هنا</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF حتى 10MB</p>
                </div>
              </div>
              {imagePreview && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={imagePreview}
                    alt="معاينة الصورة"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Location Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة</label>
                <select name="region" value={formData.region} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required>
                  <option value="">اختر المنطقة</option>
                  {locations.map((loc) => (
                    <option key={loc.region} value={loc.region}>
                      {loc.region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
                <select name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" disabled={!formData.region} required>
                  <option value="">اختر المدينة</option>
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحي</label>
                <select name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" disabled={!formData.city} required>
                  <option value="">اختر الحي</option>
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم التواصل (واتس آب)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Social Media */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">وسائل التواصل الاجتماعي (اختياري)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'instagram', label: 'إنستغرام' },
                  { key: 'twitter', label: 'تويتر' },
                  { key: 'facebook', label: 'فيسبوك' },
                  { key: 'tiktok', label: 'تيك توك' }
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-xs text-gray-600 mb-1">{item.label}</label>
                    <input
                      type="url"
                      value={formData.socialMedia[item.key]}
                      onChange={(e) => handleSocialMediaChange(item.key, e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                      placeholder={`https://${item.key}.com/...`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التصنيفات</label>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">التصنيف الرئيسي</h4>
                <div className="flex flex-wrap gap-2">
                  {['مشاتل', 'مشاتل مختلطة', 'أدوات الزراعة'].map((cat) => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                        className="mr-2 h-4 w-4 text-green-600"
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-2">تصنيفات أخرى (اختياري)</h4>
                <div className="flex flex-wrap gap-2">
                  {['نباتات داخلية', 'نباتات خارجية', 'زهور', 'نخيل', 'معدات'].map((cat) => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                        className="mr-2 h-4 w-4 text-green-600"
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الخدمات (اختياري)</label>
              <div className="flex flex-wrap gap-2">
                {['delivery', 'consultation', 'maintenance', 'installation'].map((svc) => {
                  const labels = {
                    delivery: 'التوصيل',
                    consultation: 'الاستشارات',
                    maintenance: 'الصيانة',
                    installation: 'التركيب'
                  };
                  return (
                    <label key={svc} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(svc)}
                        onChange={() => handleServiceChange(svc)}
                        className="mr-2 h-4 w-4 text-green-600"
                      />
                      <span className="text-sm">{labels[svc]}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-green-600"
                />
                <span className="text-sm">مميز</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-green-600"
                />
                <span className="text-sm">منشور</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                {loading ? 'جاري الحفظ...' : id ? 'تحديث' : 'إضافة'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/nurseries')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NurseryForm;