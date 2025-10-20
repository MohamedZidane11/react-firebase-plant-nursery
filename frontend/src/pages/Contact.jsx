// src/pages/Contact.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear messages on new input
    if (success || error) {
      setSuccess('');
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    // Simple validation
    if (!formData.name.trim()) {
      setError('الاسم مطلوب');
      setLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      setLoading(false);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      setLoading(false);
      return;
    }
    if (!formData.subject.trim()) {
      setError('الموضوع مطلوب');
      setLoading(false);
      return;
    }
    if (!formData.message.trim()) {
      setError('الرسالة مطلوبة');
      setLoading(false);
      return;
    }

    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'https://nurseries.qvtest.com';

      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل الإرسال');
      }

      setSuccess(result.message);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">اتصل بنا</h1>

              {success && (
                <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg text-center">
                  {success}
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div>
                  <h2 className="text-xl font-bold text-green-800 mb-4">معلومات التواصل</h2>
                  <div className="space-y-4">
                    {/*<div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div className="mr-4 text-right">
                        <p className="text-gray-600">البريد الإلكتروني</p>
                        <p className="font-medium text-green-800">tshgeer50@gmail.com</p>
                      </div>
              </div>*/}

                    {/*<div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.54 1.06l-1.519.76a11.042 11.042 0 006.105 6.105l.76-1.519a1 1 0 011.06-.54l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div className="mr-4 text-right">
                        <p className="text-gray-600"> </p>
                        <p className="font-medium text-green-800"></p>
                      </div>
                    </div>*/}

                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.54 1.06l-1.519.76a11.042 11.042 0 006.105 6.105l.76-1.519a1 1 0 011.06-.54l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div className="mr-4 text-right">
                        <p className="text-gray-600">رقم الواتساب</p>
                        <p className="font-medium text-green-800">0552020272</p>
                      </div>
                  </div>

                    {/*<div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.707 12.707a1 1 0 00-1.414 0l-3.95 3.95a1 1 0 001.414 1.414l1.5-1.5a1 1 0 011.414 0l3.95 3.95a1 1 0 001.414-1.414l-1.5-1.5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5.437a2 2 0 01.586-1.414l5.414-5.414A2 2 0 0115.414 0H18a2 2 0 012 2v3.437a2 2 0 01-.586 1.414l-5.414 5.414A2 2 0 0112 10z" />
                      </svg>
                      <div className="mr-4 text-right">
                        <p className="text-gray-600">العنوان</p>
                        <p className="font-medium text-green-800"></p>
                      </div>
                    </div>*/}
                  </div>
                </div>

                {/* Contact Form */}
                <div>
                  <h2 className="text-xl font-bold text-green-800 mb-4">نموذج الاتصال</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 mb-2">الاسم الكامل *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="أدخل اسمك الكامل"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-gray-700 mb-2">البريد الإلكتروني *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="أدخل بريدك الإلكتروني"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-gray-700 mb-2">العنوان *</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="أدخل عنوان الرسالة"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-gray-700 mb-2">الرسالة *</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="أكتب رسالتك هنا..."
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full transition-colors w-full disabled:opacity-70"
                    >
                      {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;