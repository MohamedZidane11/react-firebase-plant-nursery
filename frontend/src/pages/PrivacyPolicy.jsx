import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
  const { seo } = useSEO('privacy');

  return (
    <>
      <SEO
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        ogUrl="https://nurseries.qvtest.com/privacy"
        canonical="https://nurseries.qvtest.com/privacy"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-gray-600 hover:text-green-600">الرئيسية</Link>
              <span className="text-gray-400">›</span>
              <span className="text-gray-800 font-semibold">سياسة الخصوصية</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-green-800">سياسة الخصوصية</h1>
          
          <div className="bg-[#eeebd0] rounded-xl shadow-md p-6 md:p-8 space-y-6 text-gray-700 leading-relaxed">
            <p>⦿ في <strong>مشاتل السعودية</strong>، نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p>

            <div>
              <h2 className="text-xl font-bold text-green-700 mb-3">جمع البيانات</h2>
              <p>نقوم بجمع بعض المعلومات الخاصة بالمشاتل مثل اسم المشتل، بيانات التواصل (البريد الإلكتروني، رقم الهاتف، الموقع الجغرافي)، وسنة التأسيس عند التسجيل أو استخدام خدماتنا.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-green-700 mb-3">استخدام البيانات</h2>
              <p>نستخدم هذه المعلومات لعرض المشتل على المنصة، تسهيل تواصل العملاء مع المشاتل، وتحسين تجربة الاستخدام.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-green-700 mb-3">مشاركة البيانات</h2>
              <p>لا تتم مشاركة بياناتك مع أي طرف ثالث إلا في حالات قانونية أو مع شركائنا الخدميين بغرض إتمام عمليات الشراء أو التوصيل.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-green-700 mb-3">حماية البيانات</h2>
              <p>نتخذ جميع الإجراءات الأمنية والتقنية لحماية بياناتك من الوصول غير المصرح به.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-green-700 mb-3">حقوق المستخدم</h2>
              <p>يمكنك طلب تعديل أو حذف بياناتك في أي وقت عبر التواصل معنا.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;