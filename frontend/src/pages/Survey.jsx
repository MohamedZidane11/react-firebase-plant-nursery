import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Survey = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interest_level: '',
    expected_features: '',
    service_suggestions: '',
    communication_method: '',
    directory_interest: '',
    preferred_offers: [],
    region: '',
    additional_comments: ''
  });

  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Calculate progress
  useEffect(() => {
    const requiredFields = ['interest_level', 'expected_features', 'communication_method', 'directory_interest', 'region'];
    const filledCount = requiredFields.filter(field => {
      if (field === 'preferred_offers') {
        return formData[field].length > 0;
      }
      return formData[field] && formData[field].trim() !== '';
    }).length;

    const hasOffers = formData.preferred_offers.length > 0;
    const totalRequired = requiredFields.length + (hasOffers ? 1 : 0);
    const totalFilled = filledCount + (hasOffers ? 1 : 0);
    
    setProgress((totalFilled / (requiredFields.length + 1)) * 100);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
  
    // Clean phone input: keep only digits, limit to 15
    if (name === 'phone') {
      newValue = value.replace(/\D/g, '').slice(0, 15);
    }
  
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleCheckboxChange = (value) => {
    setFormData(prev => ({
      ...prev,
      preferred_offers: prev.preferred_offers.includes(value)
        ? prev.preferred_offers.filter(item => item !== value)
        : [...prev.preferred_offers, value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requiredFields = {
      interest_level: 'مستوى الاهتمام',
      expected_features: 'الميزات المتوقعة',
      communication_method: 'وسيلة التواصل',
      directory_interest: 'الاهتمام بالدليل',
      region: 'المنطقة'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field].trim() === '') {
        alert(`الرجاء ملء حقل: ${label}`);
        return;
      }
    }

    if (formData.preferred_offers.length === 0) {
      alert('الرجاء اختيار نوع واحد على الأقل من العروض المفضلة');
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        whatsapp: formData.phone, // Copy phone to whatsapp field for backend compatibility
        timestamp: new Date().toISOString(),
        platform: 'مشاتل',
        status: 'active'
      };

      const response = await fetch('http://localhost:5000/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit)
      });

      if (!response.ok) throw new Error('فشل إرسال الاستبيان');

      const result = await response.json();
      setSavedData(dataToSubmit);
      setSubmitted(true);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('حدث خطأ أثناء إرسال الاستبيان. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/survey`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('✅ تم نسخ الرابط بنجاح!');
      setShowShareModal(false);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('✅ تم نسخ الرابط بنجاح!');
        setShowShareModal(false);
      } catch (err2) {
        alert('❌ فشل نسخ الرابط. يرجى نسخه يدوياً: ' + shareUrl);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleSocialShare = (platform) => {
    const shareUrl = `${window.location.origin}/survey`;
    const shareText = '🌱 شارك في استبيان منصة مشاتل!\n\nساهم في تطوير أول منصة للمشاتل والخدمات الزراعية في السعودية.';
    
    let url = '';
    switch(platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl + '\n\n#مشاتل #الزراعة #السعودية')}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=مشاتل,الزراعة,السعودية`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareModal(false);
  };

  const downloadData = () => {
    const dataStr = JSON.stringify(savedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mashatel-survey-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (submitted) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-green-800 mb-4">شكراً لك على المشاركة!</h2>
              <p className="text-gray-700 text-lg mb-6">
                تم إرسال استبيانك بنجاح. رأيك يساعدنا في تطوير منصة مشاتل لتكون الأفضل لك.
              </p>
              
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <button
                  onClick={handleShare}
                  className="bg-[#386641] hover:bg-[#3a5a40] text-white px-6 py-3 rounded-full font-medium transition-all flex items-center justify-center gap-2"
                >
                  <span>📤</span>
                  شارك الاستبيان
                </button>
                
                <button
                  onClick={downloadData}
                  className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full font-medium transition-all"
                >
                  تحميل البيانات (JSON)
                </button>

                <Link
                  to="/"
                  className="text-[#386641] hover:underline mt-4"
                >
                  ← العودة إلى الصفحة الرئيسية
                </Link>
              </div>
            </div>
          </div>
        </div>

        {showShareModal && (
          <div 
            className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <div 
              className="bg-white rounded-xl p-4 w-[280px] shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-green-800">مشاركة الاستبيان</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => handleSocialShare('whatsapp')}
                  className="flex flex-col items-center p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs"
                >
                  <span className="text-2xl mb-1">📱</span>
                  WhatsApp
                </button>

                <button
                  onClick={() => handleSocialShare('twitter')}
                  className="flex flex-col items-center p-3 bg-blue-400 hover:bg-blue-500 text-white rounded-lg text-xs"
                >
                  <span className="text-2xl mb-1">🐦</span>
                  Twitter
                </button>

                <button
                  onClick={() => handleSocialShare('facebook')}
                  className="flex flex-col items-center p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs"
                >
                  <span className="text-2xl mb-1">👥</span>
                  Facebook
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs"
                >
                  <span className="text-2xl mb-1">📋</span>
                  نسخ الرابط
                </button>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#6a994e] to-[#386641] text-white rounded-t-2xl p-8 text-center shadow-lg">
            <h1 className="text-4xl font-bold mb-4">🌱 استبيان منصة مشاتل</h1>
            <p className="text-lg opacity-95">
              منصتك الأولى للمشاتل والخدمات الزراعية في المملكة العربية السعودية
            </p>
          </div>

          {/* Motivational Message */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 border-b-4 border-[#386641]">
            <h2 className="text-xl font-bold text-green-800 mb-2 text-center">
              🚀 شارك برأيك وساهم في تطوير أول منصة لعرض المشاتل والخدمات الزراعية في السعودية!
            </h2>
            <p className="text-gray-700 text-center">
              رأيك مهم جداً لنا ويساعدنا في تقديم أفضل الخدمات التي تلبي احتياجاتك
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white p-6">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#386641] to-emerald-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center mt-2">{Math.round(progress)}% مكتمل</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-2xl p-8">
            {/* Question 1 - Name */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border-r-4 border-[#386641]">
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#386641] text-white rounded-full text-sm mr-2 ml-2">1</span>
                الاسم (اختياري) 👤
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="اكتب اسمك هنا..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#386641] focus:outline-none transition-colors"
              />
            </div>

            {/* Question 2 - Phone Number (NEW) */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border-r-4 border-[#386641]">
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#386641] text-white rounded-full text-sm mr-2 ml-2">2</span>
                رقم الجوال (اختياري) 📱
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="05xxxxxxxx"
                maxLength={15}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#386641] focus:outline-none transition-colors"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-2">مثال: 0501234567 (حد أقصى 15 رقم)</p>
            </div>

            {/* Question 3 - Email */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border-r-4 border-[#386641]">
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#386641] text-white rounded-full text-sm mr-2 ml-2">3</span>
                البريد الإلكتروني (اختياري) 📧
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#386641] focus:outline-none transition-colors"
                dir="ltr"
              />
            </div>

            {/* Question 4 - Interest Level */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border-r-4 border-[#386641]">
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#386641] text-white rounded-full text-sm mr-2 ml-2">4</span>
                ما هو مستوى اهتمامك بالزراعة؟ <span className="text-red-500">*</span> 🌿
              </label>
              <div className="space-y-3">
                {[
                  { value: 'مبتدئ', label: 'مبتدئ - أرغب في البدء' },
                  { value: 'هاوي', label: 'هاوي - أمارس الزراعة المنزلية' },
                  { value: 'محترف', label: 'محترف - لدي خبرة واسعة' },
                  { value: 'صاحب نشاط تجاري', label: 'صاحب نشاط تجاري زراعي' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.interest_level === option.value
                        ? 'border-[#386641] bg-green-50 shadow-md'
                        : 'border-gray-300 hover:border-[#386641] hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="interest_level"
                      value={option.value}
                      checked={formData.interest_level === option.value}
                      onChange={handleInputChange}
                      className="mr-3 scale-125 accent-[#386641] ml-2"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 5 - Expected Features */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border-r-4 border-[#386641]">
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#386641] text-white rounded-full text-sm mr-2 ml-2">5</span>
                ما الميزات التي تتوقع وجودها في منصة "مشاتل"؟ <span className="text-red-500">*</span> ⭐
              </label>
              <textarea
                name="expected_features"
                value={formData.expected_features}
                onChange={handleInputChange}
                placeholder="اكتب توقعاتك هنا... مثل: عرض المشاتل القريبة، مقارنة الأسعار، تقييمات المستخدمين..."
                rows="4"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#386641] focus:outline-none transition-colors resize-vertical"
              />
            </div>

            {/* Question 6 - Service Suggestions */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border-r-4 border-[#386641]">
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#386641] text-white rounded-full text-sm mr-2 ml-2">6</span>
                هل لديك اقتراحات لإضافة خدمات جديدة داخل المنصة؟ 💡
              </label>
              <textarea
                name="service_suggestions"
                value={formData.service_suggestions}
                onChange={handleInputChange}
                placeholder="شاركنا أفكارك المبتكرة... مثل: خدمة الاستشارات، التوصيل، ورش تدريبية..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#386641] focus:outline-none transition-colors resize-vertical"
              />
            </div>

            {/* Question 7 - Communication Method */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border-r-4 border-[#386641]">
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#386641] text-white rounded-full text-sm mr-2 ml-2">7</span>
                ما الوسيلة التي تفضلها للتفاعل مع منصة مشاتل؟ <span className="text-red-500">*</span> 📱
              </label>
              <div className="space-y-3">
                {[
                  { value: 'واتساب', label: 'واتساب' },
                  { value: 'بريد إلكتروني', label: 'بريد إلكتروني' },
                  { value: 'منصة إلكترونية فقط', label: 'منصة إلكترونية فقط' },
                  { value: 'جميع الوسائل', label: 'جميع الوسائل' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.communication_method === option.value
                        ? 'border-[#386641] bg-green-50 shadow-md'
                        : 'border-gray-300 hover:border-[#386641] hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="communication_method"
                      value={option.value}
                      checked={formData.communication_method === option.value}
                      onChange={handleInputChange}
                      className="mr-3 scale-125 accent-[#386641] ml-2"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 8 - Directory Interest */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border-r-4 border-[#386641]">
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#386641] text-white rounded-full text-sm mr-2 ml-2">8</span>
                هل تهتم بالاشتراك في دليل خاص بالمشاتل أو أصحاب النشاط الزراعي؟ <span className="text-red-500">*</span> 📋
              </label>
              <div className="space-y-3">
                {[
                  { value: 'نعم، مجاناً', label: 'نعم، مجاناً' },
                  { value: 'نعم، حتى لو برسوم رمزية', label: 'نعم، حتى لو برسوم رمزية' },
                  { value: 'لا، غير مهتم', label: 'لا، غير مهتم' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.directory_interest === option.value
                        ? 'border-[#386641] bg-green-50 shadow-md'
                        : 'border-gray-300 hover:border-[#386641] hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="directory_interest"
                      value={option.value}
                      checked={formData.directory_interest === option.value}
                      onChange={handleInputChange}
                      className="mr-3 scale-125 accent-[#386641] ml-2"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 9 - Preferred Offers */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border-r-4 border-[#386641]">
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#386641] text-white rounded-full text-sm mr-2 ml-2">9</span>
                ما نوع العروض أو الحملات التي تجذبك أكثر؟ (يمكن اختيار أكثر من خيار) <span className="text-red-500">*</span> 🎁
              </label>
              <div className="space-y-3">
                {[
                  { value: 'خصومات على المنتجات', label: 'خصومات على المنتجات' },
                  { value: 'استشارات مجانية', label: 'استشارات مجانية' },
                  { value: 'شحن مجاني', label: 'شحن مجاني' },
                  { value: 'نقاط مكافآت', label: 'نقاط مكافآت' },
                  { value: 'ورش تدريبية', label: 'ورش تدريبية' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.preferred_offers.includes(option.value)
                        ? 'border-[#386641] bg-green-50 shadow-md'
                        : 'border-gray-300 hover:border-[#386641] hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.preferred_offers.includes(option.value)}
                      onChange={() => handleCheckboxChange(option.value)}
                      className="mr-3 scale-125 accent-[#386641] ml-2"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 10 - Region */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border-r-4 border-[#386641]">
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#386641] text-white rounded-full text-sm mr-2 ml-2">10</span>
                ما المنطقة التي تقيم فيها في المملكة؟ <span className="text-red-500">*</span> 📍
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#386641] focus:outline-none transition-colors"
              >
                <option value="">اختر المنطقة...</option>
                <option value="منطقة الرياض">منطقة الرياض</option>
                <option value="منطقة مكة المكرمة">منطقة مكة المكرمة</option>
                <option value="منطقة المدينة المنورة">منطقة المدينة المنورة</option>
                <option value="منطقة القصيم">منطقة القصيم</option>
                <option value="منطقة الشرقية">المنطقة الشرقية</option>
                <option value="منطقة عسير">منطقة عسير</option>
                <option value="منطقة تبوك">منطقة تبوك</option>
                <option value="منطقة حائل">منطقة حائل</option>
                <option value="منطقة الحدود الشمالية">منطقة الحدود الشمالية</option>
                <option value="منطقة جازان">منطقة جازان</option>
                <option value="منطقة نجران">منطقة نجران</option>
                <option value="منطقة الباحة">منطقة الباحة</option>
                <option value="منطقة الجوف">منطقة الجوف</option>
              </select>
            </div>

            {/* Question 11 - Additional Comments */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border-r-4 border-[#386641]">
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#386641] text-white rounded-full text-sm mr-2 ml-2">11</span>
                أي تعليقات أو ملاحظات إضافية تود مشاركتها معنا؟ 💬
              </label>
              <textarea
                name="additional_comments"
                value={formData.additional_comments}
                onChange={handleInputChange}
                placeholder="شاركنا أي ملاحظات أو اقتراحات أخرى..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#386641] focus:outline-none transition-colors resize-vertical"
              />
            </div>

            {/* Submit Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#386641] to-emerald-600 hover:from-[#3a5a40] hover:to-emerald-700 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span>جاري الإرسال...</span>
                  ) : (
                    <span>📤 إرسال الرأي</span>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-in-out flex items-center justify-center gap-2"
                >
                  <span>🔗 مشاركة الاستبيان</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="bg-white rounded-xl p-4 w-[280px] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-green-800">مشاركة الاستبيان</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="flex flex-col items-center p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs"
              >
                <span className="text-2xl mb-1">📱</span>
                WhatsApp
              </button>

              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex flex-col items-center p-3 bg-blue-400 hover:bg-blue-500 text-white rounded-lg text-xs"
              >
                <span className="text-2xl mb-1">🐦</span>
                Twitter
              </button>

              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex flex-col items-center p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs"
              >
                <span className="text-2xl mb-1">👥</span>
                Facebook
              </button>

              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs"
              >
                <span className="text-2xl mb-1">📋</span>
                نسخ الرابط
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Survey;