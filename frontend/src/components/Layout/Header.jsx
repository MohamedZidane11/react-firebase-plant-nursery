// src/components/Header.jsx
import { Link } from 'react-router-dom';
import logo from '../assets/tashgeel_logo.svg'; // ✅ Your SVG logo

const Header = () => {
  return (
    <header className="bg-green-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          {/* Remove the yellow circle, just show the SVG */}
          <img
            src={logo}
            alt="تاشجيل - منصة المشاتل"
            className="h-12 w-auto object-contain" // ✅ Height 3rem, auto width
          />
          <span className="text-xl font-bold tracking-wide">منصة المشاتل</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="hover:text-yellow-300 transition-colors duration-200">
            الرئيسية
          </Link>
          <Link to="/nurseries" className="hover:text-yellow-300 transition-colors duration-200">
            المشاتل
          </Link>
          <Link to="/offers" className="hover:text-yellow-300 transition-colors duration-200">
            العروض
          </Link>
          <Link to="/contact" className="hover:text-yellow-300 transition-colors duration-200">
            اتصل بنا
          </Link>
        </nav>

        {/* Register Button */}
        <Link to="/register">
          <button className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">
            سجل مشتلك
          </button>
        </Link>
      </div>
    </header>
  );
};

export default Header;