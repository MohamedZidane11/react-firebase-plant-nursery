// src/components/Header.jsx
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../assets/logo.png'; // ✅ Your SVG logo


const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close menu after navigation
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white text-white shadow-lg relative">
      {/*test double navbar*/}
      <section className="bg-emerald-800 text-white shadow-lg relative">
        <div className="container mx-auto px-4 py-3"> {/* Reduced py for mobile */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">

            {/* Left Section — Welcome Text */}
            <div className="flex flex-wrap items-center justify-center md:justify-start space-x-3 rtl:space-x-reverse z-10 md:mr-8">
              <span className="text-xs md:text-base tracking-wide text-center md:text-left">
                🌿 مرحباً بكم في منصة مشاتل السعودية 
              </span>
              {/*<span className="text-xs md:text-base tracking-wide text-center md:text-left">
                📞 الدعم: +4567 123 50 966
              </span>*/}
            </div>

            {/* Right Section — Email */}
            {/*<div className="flex items-center space-x-3 rtl:space-x-reverse z-10 md:ml-8  md:mt-0">
              <span className="text-xs md:text-base tracking-wide">
                📧 info@nurseries.sa
              </span>
            </div>*/}
          </div>
        </div>
      </section>
      <section className="bg-green-100 text-black shadow-lg relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">

            {/* ✅ Logo Section — LEFT (UNCHANGED) */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse z-10 mr-8 hover:scale-105 transition-transform duration-500 ease-in-out">
              <Link
                to="/"
                onClick={handleLinkClick}>
                <img
                  src={logo}
                  alt="تشجير - منصة المشاتل"
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <span className="text-green-800 text-3xl font-bold tracking-wide">منصة المشاتل</span>
            </div>

            {/* ✅ Desktop Navigation — CENTER (ABSOLUTE POSITIONING) */}
            <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-8 rtl:space-x-reverse">
              <Link
                to="/"
                onClick={handleLinkClick}
                className={`text-lg hover:text-yellow-300 hover:scale-105 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-green-700 ${location.pathname === '/' ? 'text-white font-bold bg-green-700' : ''}`}
              >
              🏠 الرئيسية
              </Link>
              <Link
                to="/nurseries"
                onClick={handleLinkClick}
                className={`text-lg hover:text-yellow-300 hover:scale-105 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-green-700 ${location.pathname === '/nurseries' ? 'text-white font-bold bg-green-700' : ''}`}
              >
              🌿 المشاتل
              </Link>
              <Link
                to="/offers"
                onClick={handleLinkClick}
                className={`text-lg hover:text-yellow-300 hover:scale-105 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-green-700 ${location.pathname === '/offers' ? 'text-white font-bold bg-green-700' : ''}`}
              >
              🎯 العروض
              </Link>
              <Link
                to="/contact"
                onClick={handleLinkClick}
                className={`text-lg hover:text-yellow-300 hover:scale-105 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-green-700 ${location.pathname === '/contact' ? 'text-white font-bold bg-green-700' : ''}`}
              >
              📞 اتصل بنا
              </Link>
            </nav>

            {/* ✅ Register Button — RIGHT */}
            <div className="hidden md:block z-10 ml-8">
              <Link to="/register">
                <button className="bg-gradient-to-l from-yellow-600 to-yellow-500 hover:bg-green-700 px-6 py-2.5 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
                📝 سجل مشتلك
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center z-10">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-yellow-600 focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden mt-4 bg-green-300 rounded-lg shadow-lg overflow-hidden animate-fadeIn">
              <nav className="flex flex-col p-4 space-y-4 text-right">
                <Link
                  to="/"
                  onClick={handleLinkClick}
                  className={`py-3 px-5 rounded-lg hover:bg-green-600 transition text-lg ${location.pathname === '/' ? 'text-white bg-green-600 font-bold' : ''}`}
                >
                 🏠 الرئيسية
                </Link>
                <Link
                  to="/nurseries"
                  onClick={handleLinkClick}
                  className={`py-3 px-5 rounded-lg hover:bg-green-600 transition text-lg ${location.pathname === '/nurseries' ? 'text-white bg-green-600 font-bold' : ''}`}
                >
                 🌿 المشاتل
                </Link>
                <Link
                  to="/offers"
                  onClick={handleLinkClick}
                  className={`py-3 px-5 rounded-lg hover:bg-green-600 transition text-lg ${location.pathname === '/offers' ? 'text-white bg-green-600 font-bold' : ''}`}
                >
                 🎯 العروض
                </Link>
                <Link
                  to="/contact"
                  onClick={handleLinkClick}
                  className={`py-3 px-5 rounded-lg hover:bg-green-600 transition text-lg ${location.pathname === '/contact' ? 'text-white bg-green-600 font-bold' : ''}`}
                >
                 📞 اتصل بنا
                </Link>
                <Link to="/register">
                  <button
                    onClick={handleLinkClick}
                    className="w-full text-right bg-gradient-to-l from-yellow-600 to-yellow-500 hover:bg-green-700 px-6 py-3 rounded-lg shadow transition text-lg font-medium"
                  >
                   📝 سجل مشتلك
                  </button>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </section>
    </header>
  );
};

export default Header;