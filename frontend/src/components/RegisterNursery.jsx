// src/pages/RegisterNursery.jsx
import React, { useState } from 'react';
import axios from 'axios';

const RegisterNursery = () => {
  const [formData, setFormData] = useState({
    name: '',
    categories: [],
    location: '',
    services: [],
    featured: false,
    contactName: '',
    whatsapp: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation (remove image validation)
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
    if (!formData.location.trim()) newErrors.location = 'الموقع مطلوب';
    if (!formData.contactName.trim()) newErrors.contactName = 'اسم المسئول مطلوب';
    if (!formData.whatsapp.trim()) newErrors.whatsapp = 'رقم الواتس آب مطلوب';
    if (!/^[\d+\-\s()]{8,15}$/.test(formData.whatsapp.trim())) {
      newErrors.whatsapp = 'رقم الواتس آب غير صالح';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        location: formData.location.trim(),
        contactName: formData.contactName.trim(),
        whatsapp: formData.whatsapp.trim(),
        submittedAt: new Date().toISOString(),
        status: 'pending'
        // ❌ No image field
      };

      await axios.post(
        'https://react-firebase-plant-nursery-production.up.railway.app/api/pending-nurseries',
        payload
      );

      alert('تم تسجيل مشتلّك بنجاح! سيقوم الفريق بمراجعته خلال 24 ساعة.');

      // Reset form
      setFormData({
        name: '',
        categories: [],
        location: '',
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-green-800">
            سجل مشتلّك
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم المشتل
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
                اسم المسئول
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
                رقم التواصل (واتس آب)
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

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التصنيف الرئيسي
              </label>
              <div className="flex flex-wrap gap-2">
                {['زهور', 'نخيل', 'نباتات داخلية', 'نباتات خارجية', 'مشاتل مختلطة', 'معدات', 'أدوات الزراعة'].map((cat) => (
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

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الموقع
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="مثل: الرياض - حي النخيل"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Services */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الخدمات المقدمة
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