import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import SEO from '../components/SEO';

const TermsOfUse = () => {
  const { seo } = useSEO('terms');

  return (
    <>
      <SEO
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        ogUrl="https://nurseries.qvtest.com/terms"
        canonical="https://nurseries.qvtest.com/terms"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-gray-600 hover:text-green-600">الرئيسية</Link>
              <span className="text-gray-400">›</span>
              <span className="text-gray-800 font-semibold">شروط الاستخدام</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-green-800">شروط الاستخدام</h1>
          
          <div className="bg-[#eeebd0] rounded-xl shadow-md p-6 md:p-8 space-y-6 text-gray-700 leading-relaxed">
            <p>⦾ باستخدامك لموقع <strong>مشاتل السعودية</strong> فأنت توافق على الشروط التالية:</p>

            <ol className="list-decimal pr-6 space-y-4">
              <li>يلتزم المستخدم باستخدام المنصة للأغراض المشروعة فقط (عرض، أو البحث عن مشاتل ومنتجاتها).</li>
              <li>لا يجوز نسخ أو إعادة نشر أي محتوى من الموقع دون إذن كتابي مسبق.</li>
              <li>الموقع لا يتحمل مسؤولية مباشرة عن تعاملاتك مع المشاتل المسجلة، لكنه يوفر منصة موثوقة للربط بين الطرفين.</li>
              <li>يحتفظ الموقع بحق تعديل أو تحديث هذه الشروط في أي وقت.</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfUse;