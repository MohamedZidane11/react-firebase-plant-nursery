// src/pages/RegisterNursery.jsx
import React, { useState } from 'react';
import axios from 'axios';

const RegisterNursery = () => {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    categories: [],
    location: '',
    services: [],
    featured: false,
    discount: null,
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

    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
    if (!formData.location.trim()) newErrors.location = 'الموقع مطلوب';
    if (!formData.image.trim()) newErrors.image = 'صورة المشتل مطلوبة';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    try {
      const trimmedFormData = {
        ...formData,
        name: formData.name.trim(),
        location: formData.location.trim(),
        image: formData.image.trim(),
        discount: formData.discount ? Number(formData.discount) : null,
      };

      // ✅ Send to backend
      await axios.post('https://react-plant-nursery-website-production-4ff3.up.railway.app/api/nurseries', trimmedFormData); // local=> http://localhost:5000/api/nurseries

      alert('تم تسجيل مشتلّك بنجاح! سيظهر قريبًا في القائمة.');
      
      // Reset form
      setFormData({
        name: '',
        image: '',
        categories: [],
        location: '',
        services: [],
        featured: false,
        discount: null,
      });
      setErrors({});

    } catch (err) {
      console.error('Error submitting nursery:', err);
      alert('فشل في الإرسال. تأكد من أن الخادم يعمل.');
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

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رابط الصورة
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                  errors.image ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
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

            {/* Featured & Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-green-600"
                  />
                  <span className="text-sm">عرض كـ "مميز"</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الخصم (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount || ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="مثل: 25"
                />
              </div>
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