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

// src/components/Footer.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState({
    footerLinks: ['الرئيسية', 'المشاتل', 'العروض', 'اتصل بنا'],
    social: {
      instagram: 'nursery.sa',
      twitter: 'nursery_sa',
      tiktok: 'nursery.sa',
      snapchat: 'nursery-sa'
    },
    contacts: {
      email: 'info@nursery.com',
      phone: '0551234567'
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_BASE = 'https://react-firebase-plant-nursery-production.up.railway.app';
        const response = await fetch(`${API_BASE}/api/settings/site`);
        if (!response.ok) throw new Error('Failed to fetch settings');
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
          {/* تواصل معنا */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-300">تابعنا</h3>
            <ul className="space-y-2">
              <li><a href={`https://instagram.com/${siteSettings.social.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">انستجرام</a></li>
              <li><a href={`https://twitter.com/${siteSettings.social.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">تويتر</a></li>
              <li><a href={`https://tiktok.com/@${siteSettings.social.tiktok}`} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">تيك توك</a></li>
              <li><a href={`https://snapchat.com/add/${siteSettings.social.snapchat}`} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300">سناب شات</a></li>
            </ul>
          </div>

          {/* تواصل معنا */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-300">تواصل معنا</h3>
            <ul className="space-y-2">
              <li>{siteSettings.contacts.email} 📧</li>
              <li>{siteSettings.contacts.phone} 📞</li>
              <li>الرياض، المملكة العربية السعودية 📍</li>
            </ul>
          </div>

          {/* روابط سريعة */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-300">روابط سريعة</h3>
            <ul className="space-y-2">
              {siteSettings.footerLinks.map((link, i) => (
                <li key={i}>
                  <Link to={`/${link.trim().toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-yellow-300">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
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
          <p>&copy; 2025 منصة المشاتل. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;