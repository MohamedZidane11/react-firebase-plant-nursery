import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const faqs = [
    {
      question: "كيف أسجل مشتلي في المنصة؟",
      answer: "من خلال صفحة \"سجل مشتلك\"، قم بإدخال بيانات المشتل والخدمات، وسيتم التواصل معك لتأكيد التسجيل."
    },
    {
      question: "هل التسجيل مجاني؟",
      answer: "نعم، التسجيل مجاني تمامًا لجميع المشاتل."
    },
    {
      question: "هل يقدم الموقع خدمات التوصيل؟",
      answer: "خدمات التوصيل متاحة من خلال بعض المشاتل، ويتم توضيحها في صفحة كل مشتل."
    },
    {
      question: "كيف أتعرف على العروض الحالية؟",
      answer: "يمكنك الدخول على صفحة \"العروض\" لمتابعة جميع العروض الحصرية المحدثة يوميًا."
    },
    {
      question: "هل يمكنني شراء مباشرة من الموقع؟",
      answer: "الموقع يعمل كمنصة تعريف وربط بين العملاء والمشاتل، والشراء يتم عبر التواصل المباشر مع المشتل."
    },
    {
      question: "كيف أحمي بياناتي؟",
      answer: "نلتزم بتأمين بياناتك وعدم مشاركتها مع أي طرف ثالث."
    }
  ];

  // Track which FAQ is open (single open at a time)
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-green-600">الرئيسية</Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-800 font-semibold">الأسئلة الشائعة</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-green-800">الأسئلة الشائعة</h1>
        
        <div className="space-y-4 bg-[#eeebd0] p-6 rounded-xl">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
            >
              {/* Question Header */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-right flex justify-between items-center focus:outline-none hover:bg-gray-50 transition"
                aria-expanded={openIndex === index}
              >
                <span className="text-lg font-bold text-gray-800">{faq.question}</span>
                <span className="text-2xl text-green-600 ml-3">
                  {openIndex === index ? '↑' : '↓'}
                </span>
              </button>

              {/* Answer (Animated) */}
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">هل لديك سؤال آخر؟</p>
          <Link 
            to="/contact" 
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition"
          >
            تواصل معنا
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;