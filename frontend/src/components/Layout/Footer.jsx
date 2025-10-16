// src/components/Footer.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState({
    contacts: { address: "الرياض، المملكة العربية السعودية", email: 'info@nursery.com', whatsapp: "+4567 123 50 966", phone: '0551234567' },
    social: {facebook: '', instagram: '', twitter: '' },
    footerLinks: ['الرئيسية', 'المشاتل', 'العروض', 'اتصل بنا']
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_BASE = 'https://nurseries.qvtest.com';
        const response = await fetch(`${API_BASE}/api/settings/site`);
        if (!response.ok) throw new Error('فشل تحميل الإعدادات');
        const data = await response.json();
        setSiteSettings(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.warn('Using default footer settings:', err.message);
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className="bg-green-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* تابعنا */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-300">تابعنا</h3>
            <ul className="space-y-2">
              {siteSettings.social.facebook && (
                <li><a href={`https://facebook.com/@${siteSettings.social.facebook}`} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">فيسبوك</a></li>
              )}
              {siteSettings.social.instagram && (
                <li><a href={`https://instagram.com/${siteSettings.social.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">انستجرام</a></li>
              )}
              {siteSettings.social.twitter && (
                <li><a href={`https://twitter.com/${siteSettings.social.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">تويتر</a></li>
              )}
            </ul>
          </div>

          {/* تواصل معنا */}
          <div>
            
            <h3 className="text-lg font-semibold mb-4 text-yellow-300">تواصل معنا</h3>
            <ul className="space-y-2">
              {/*<li>📧 {siteSettings.contacts.email}</li>*/}
              <li>📞 الهاتف: {siteSettings.contacts.phone}</li>
              <li>💬 الواتساب: {siteSettings.contacts.whatsapp}</li>
              {/*<li>📍 {siteSettings.contacts.address}</li>*/}
            </ul>
            
          </div>

          {/* روابط سريعة */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-yellow-300">روابـط سـريـعـة</h3>
            <div className="flex flex-col sm:flex-row gap-1">
              {/* First Column */}
              <ul className="space-y-2 flex-1">
                <li><Link to="/" className="hover:text-yellow-300">الرئيسية</Link></li>
                <li><Link to="/nurseries" className="hover:text-yellow-300">المشاتل</Link></li>
                <li><Link to="/offers" className="hover:text-yellow-300">العروض</Link></li>
                <li><Link to="/PrivacyPolicy" className="hover:text-yellow-300">سياسة الخصوصية</Link></li>
              </ul>

              {/* Second Column */}
              <ul className="space-y-2 flex-1">
                <li><Link to="/TermsOfUse" className="hover:text-yellow-300">شروط الاستخدام</Link></li>
                <li><Link to="/AboutUs" className="hover:text-yellow-300">من نحن</Link></li>
                <li><Link to="/FAQ" className="hover:text-yellow-300">الأسئلة الشائعة</Link></li>
              </ul>
            </div>
          </div>

          {/* عن المنصة */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-300">عن المنصة</h3>
            <p className="text-sm">
              منصة المشاتل تجمع أفضل المشاتل ومحلات أدوات الزراعة في مكان واحد.
            </p>
          </div>
        </div>

        <div className="border-t border-green-700 mt-8 pt-8 text-center text-sm">
          <p className="pb-4">&copy; 2025 مشاتل السعودية - جميع الحقوق محفوظة</p>
          <p>نحن ملتزمون بدعم المشاتل السعودية وتطوير قطاع الزراعة في المملكة</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;