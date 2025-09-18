{/*
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-300">تابعنا</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-yellow-300">فيسبوك</a></li>
              <li><a href="#" className="hover:text-yellow-300">تويتر</a></li>
              <li><a href="#" className="hover:text-yellow-300">انستجرام</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-300">تواصل معنا</h3>
            <ul className="space-y-2">
              <li>info@nurseries.sa <span className="text-xs">📧</span></li>
              <li>+4567 123 50 966 <span className="text-xs">📱</span></li>
              <li>الرياض، المملكة العربية السعودية <span className="text-xs">📍</span></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-300">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-yellow-300">الرئيسية</Link></li>
              <li><Link to="/nurseries" className="hover:text-yellow-300">المشاتل</Link></li>
              <li><Link to="/offers" className="hover:text-yellow-300">العروض</Link></li>
              <li><Link to="/register" className="hover:text-yellow-300">سجل مشتلك</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-300">عن المنصة</h3>
            <p className="text-sm">
              منصة المشاتل تجمع أفضل المشاتل ومحلات أدوات الزراعة في مكان واحد
            </p>
          </div>
        </div>
        
        <div className="border-t border-green-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2025 منصة المشاتل. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
*/}

{/* روابط سريعة */}
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white py-12">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-yellow-300">روابط سريعة</h3>
        <ul className="space-y-2">
          {siteSettings.footerLinks?.map((link, i) => (
            <li key={i}>
              <Link to={`/${link.toLowerCase().replace(' ', '-')}`} className="hover:text-yellow-300">
                {link}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};

export default Footer;