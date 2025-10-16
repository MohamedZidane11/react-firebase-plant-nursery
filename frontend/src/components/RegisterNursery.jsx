// src/pages/RegisterNursery.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const RegisterNursery = () => {
  const [formData, setFormData] = useState({
    name: '',
    categories: [],
    region: '',
    city: '',
    district: '',
    googleMapsLink: '',
    services: [],
    featured: false,
    contactName: '',
    whatsapp: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Load locations from Firestore
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locDoc = await getDoc(doc(db, 'locations', 'SA'));
        if (locDoc.exists()) {
          setLocations(locDoc.data().data || []);
        }
      } catch (err) {
        console.error('Error loading locations:', err);
      } finally {
        setLoadingLocations(false);
      }
    };
    loadLocations();
  }, []);

  const cities = locations.find(loc => loc.region === formData.region)?.cities || [];
  const districts = cities.find(c => c.name === formData.city)?.districts || [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleServiceChange = (service) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
    if (!formData.region) newErrors.region = 'المنطقة مطلوبة';
    if (!formData.city) newErrors.city = 'المدينة مطلوبة';
    if (!formData.contactName.trim()) newErrors.contactName = 'اسم المسئول مطلوب';
    if (!formData.whatsapp.trim()) newErrors.whatsapp = 'رقم الواتس آب مطلوب';
    if (!/^[\d+\-\s()]{8,15}$/.test(formData.whatsapp.trim())) {
      newErrors.whatsapp = 'رقم الواتس آب غير صالح';
    }

    // Optional: validate Google Maps link format (basic)
    if (formData.googleMapsLink.trim() && !formData.googleMapsLink.startsWith('https://maps.app.goo.gl/')) {
      newErrors.googleMapsLink = 'يرجى إدخال رابط خرائط جوجل صالح (يبدأ بـ https://maps.app.goo.gl/)';
    }

    // Required: Primary categories
    const primaryCats = ['مشاتل', 'مشاتل مختلطة', 'أدوات الزراعة'];
    const hasPrimary = formData.categories.some((cat) => primaryCats.includes(cat));
    if (!hasPrimary) {
      newErrors.categories = 'يرجى اختيار تصنيف رئيسي على الأقل';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const fullLocation = `${formData.region} - ${formData.city}${formData.district ? ` - ${formData.district}` : ''}`;

      const payload = {
        ...formData,
        location: fullLocation, // backward-compatible field
        name: formData.name.trim(),
        contactName: formData.contactName.trim(),
        whatsapp: formData.whatsapp.trim(),
        googleMapsLink: formData.googleMapsLink.trim(),
        submittedAt: new Date().toISOString(),
        status: 'pending',
      };

      await axios.post('http://localhost:5000/api/pending-nurseries', payload);

      alert(
        'تم تسجيل مشتلّك بنجاح! هذا تسجيل اولى وسيقوم الفريق بمراجعته خلال 24 ساعة , وسيتم التواصل معكم لاستكمال البيانات.'
      );

      // Reset form
      setFormData({
        name: '',
        categories: [],
        region: '',
        city: '',
        district: '',
        googleMapsLink: '',
        services: [],
        featured: false,
        contactName: '',
        whatsapp: '',
      });
      setErrors({});
    } catch (err) {
      console.error('Error submitting nursery:', err);
      alert('فشل في الإرسال. تأكد من الاتصال بالإنترنت.');
    } finally {
      setSubmitting(false);
    }
  };

  // Categories
  const primaryCategories = ['مشاتل', 'مشاتل مختلطة', 'أدوات الزراعة'];
  const otherCategories = ['نباتات داخلية', 'نباتات خارجية', 'زهور', 'نخيل', 'معدات'];

  if (loadingLocations) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-green-800">
            سجل مشتلّك
          </h2>
          <div className="flex items-center p-4 mb-4 text-green-800 border-t-4 border-green-300 bg-green-50 dark:text-green-400 dark:bg-gray-800 dark:border-green-800">
            <svg class="shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <h3 className="mr-2">
              هذا تسجيل اولي 
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> اسم المشتل
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="مثل: مشتل الزهور"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> اسم المسئول
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                  errors.contactName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="مثل: أحمد محمد"
              />
              {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> رقم التواصل (واتس آب)
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                  errors.whatsapp ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="مثل: 966500123456"
              />
              {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
            </div>

            {/* Location Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> المنطقة
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">اختر المنطقة</option>
                  {locations.map((loc) => (
                    <option key={loc.region} value={loc.region}>
                      {loc.region}
                    </option>
                  ))}
                </select>
                {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> المدينة
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!formData.region}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">اختر المدينة</option>
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحي</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={!formData.city}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">اختر الحي</option>
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Google Maps Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رابط الموقع من خرائط جوجل
              </label>
              <input
                type="url"
                name="googleMapsLink"
                value={formData.googleMapsLink}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                  errors.googleMapsLink ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://maps.app.goo.gl/..."
              />
              {errors.googleMapsLink && (
                <p className="text-red-500 text-sm mt-1">{errors.googleMapsLink}</p>
              )}
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-1">كيف أحصل على رابط موقعي من خرائط جوجل؟</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>افتح تطبيق خرائط جوجل على هاتفك أو من المتصفح</li>
                  <li>ابحث عن متجرك أو اضغط على الموقع في الخريطة</li>
                  <li>اضغط على زر المشاركة</li>
                  <li>اختر "نسخ الرابط" أو "Copy link"</li>
                  <li>الصق الرابط في هذا الحقل</li>
                </ol>
                <p className="mt-2">
                  <strong>ملاحظة:</strong> إذا لم يكن متجرك مسجلًا في خرائط جوجل، يمكنك:
                  <ul className="list-disc list-inside mt-1">
                    <li>وضع دبوس في موقع متحرك ثم مشاركة الرابط</li>
                    <li>أو ترك هذا الحقل فارغًا وسنساعدك لاحقًا</li>
                  </ul>
                </p>
              </div>
            </div>

            {/* Primary Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> التصنيف الرئيسي
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {primaryCategories.map((cat) => (
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
              {errors.categories && <p className="text-red-500 text-sm">{errors.categories}</p>}
            </div>

            {/* Other Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تصنيفات أخرى (اختياري)
              </label>
              <div className="flex flex-wrap gap-2">
                {otherCategories.map((cat) => (
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

            {/* Services */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الخدمات المقدمة (اختياري)
              </label>
              <div className="flex flex-wrap gap-2">
                {['delivery', 'consultation', 'maintenance', 'installation'].map((svc) => {
                  const labelMap = {
                    delivery: 'التوصيل',
                    consultation: 'الاستشارات',
                    maintenance: 'الصيانة',
                    installation: 'التركيب',
                  };
                  return (
                    <label key={svc} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(svc)}
                        onChange={() => handleServiceChange(svc)}
                        className="mr-2 h-4 w-4 text-green-600"
                      />
                      <span className="text-sm">{labelMap[svc]}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Featured */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-green-600"
                />
                <span className="text-sm">أرغب أن يظهر مشتلي كـ "مميز"</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-70"
            >
              {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegisterNursery;