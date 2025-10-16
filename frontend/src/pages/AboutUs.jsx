import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-green-600">الرئيسية</Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-800 font-semibold">من نحن</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-green-800">من نحن</h1>
        
        <div className="bg-[#eeebd0] rounded-xl shadow-md p-6 md:p-8 space-y-6 text-gray-700 leading-relaxed">
          <div>
            <p><strong>» مشاتل السعودية</strong>: هي المنصة السعودية الأولى التي تجمع لك كل ما تحتاجه من مشاتل ونباتات وخدمات زراعية في مكان واحد.</p>
          </div>

          <div>
            <p>نعرض أفضل العروض والخدمات مثل <strong>التوصيل</strong>، <strong>التجهيز والرعاية</strong>، <strong>الضمان</strong>، و<strong>الاستشارات الزراعية</strong>.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-green-700 mb-3">رؤيتنا</h2>
            <p>أن نكون الوجهة الأولى لكل من يبحث عن النباتات والخدمات الزراعية في المملكة.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-green-700 mb-3">رسالتنا</h2>
            <p>دعم المشاتل السعودية وتسهيل وصول منتجاتها وخدماتها إلى العملاء بطريقة رقمية حديثة.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;