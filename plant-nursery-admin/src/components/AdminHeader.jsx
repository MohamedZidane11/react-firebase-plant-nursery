// src/components/AdminHeader.jsx
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { auth } from '../firebase/firebase';

const AdminHeader = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: '🏠 الرئيسية' },
    { path: '/nurseries', label: '🌿 المشاتل' },
    { path: '/offers', label: '💰 العروض' },
    { path: '/banners', label: '🖼️ البانر' },
    { path: '/categories', label: '🔖 التصنيفات' },
    { path: '/premium-nurseries', label: '🌟 شركاء النجاح' },
    { path: '/sponsors', label: '✨ الرعاة' },
    { path: '/pending-nurseries', label: '📋 المراجعة' },
    { path: '/surveys', label: '📊 الاستبيانات' },
    { path: '/settings', label: '⚙️ الإعدادات' },
  ];

  return (
    <nav
      className="bg-white shadow-lg p-4 sticky top-0 z-50 w-full"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between">
        {/* Logo / Title */}
        <h1 className="text-3xl font-bold text-green-800 whitespace-nowrap mb-2">
          لوحة التحكم
        </h1>

        {/* Desktop Navigation + Logout */}
        <div className="hidden md:flex items-center space-x-1 space-x-reverse">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 font-medium rounded-lg transition-all duration-300 ease-in-out
                ${
                  isActive(item.path)
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-green-100 hover:-translate-y-1 hover:shadow-sm'
                }`}
            >
              {item.label}
            </Link>
          ))}
          {/* Logout button aligned with tabs */}
          <button
            onClick={() => auth.signOut()}
            className="px-4 py-3 mr-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition transform hover:scale-105 hover:shadow-md whitespace-nowrap"
          >
            تسجيل الخروج
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-md text-orange-500 hover:bg-gray-100 focus:outline-none"
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

        {/* Mobile Navigation (full-width below) */}
        {isOpen && (
          <div className="md:hidden w-full mt-4 p-4 bg-white rounded-lg shadow-lg animate-fadeIn">
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 font-medium rounded-lg transition-all
                      ${
                        isActive(item.path)
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'text-gray-700 hover:bg-green-100 hover:-translate-y-1 hover:shadow-sm'
                      }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {/* Logout in mobile menu */}
              <li>
                <button
                  onClick={() => {
                    auth.signOut();
                    setIsOpen(false);
                  }}
                  className="w-full text-right block px-4 py-3 font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  تسجيل الخروج
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminHeader;