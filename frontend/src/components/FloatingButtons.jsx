// src/components/FloatingButtons.jsx
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

/**
 * Floating Buttons Manager
 * A flexible system for managing multiple floating action buttons
 * 
 * Position Options:
 * - bottom-left, bottom-right
 * - top-left, top-right
 * - middle-left, middle-right
 * 
 * Button Configuration:
 * {
 *   id: 'unique-id',
 *   icon: JSX element or emoji,
 *   text: 'Button text',
 *   tooltip: 'Tooltip text',
 *   link: '/path',
 *   colors: { from: '#color1', to: '#color2' },
 *   position: 'bottom-left',
 *   hideOnPages: ['/page1', '/page2'],
 *   enabled: true
 * }
 */

const FloatingButtons = () => {
  const location = useLocation();
  const [loadedButtons, setLoadedButtons] = useState({});

  // ==========================================
  // 🔧 CONFIGURATION - Add/Remove Buttons Here
  // ==========================================
  const buttons = [
    // Survey Button
    {
      id: 'survey',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      text: 'شارك برأيك 📊',
      tooltip: 'ساعدنا في تطوير المنصة',
      link: '/survey',
      colors: { from: '#49b6ff', to: '#218380' },
      position: 'bottom-left',
      hideOnPages: ['/survey'],
      enabled: true
    },

    // WhatsApp Button
    {
      id: 'whatsapp',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
      text: 'واتساب',
      tooltip: 'راسلنا عبر واتساب',
      link: 'https://wa.me/966552020272',
      external: true,
      colors: { from: '#25D366', to: '#128C7E' },
      position: 'bottom-right',
      hideOnPages: ['/contact'],
      enabled: true
    },

    // Contact Button
    {
      id: 'contact',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      text: 'اتصل بنا',
      tooltip: 'تواصل معنا مباشرة',
      link: '/contact',
      colors: { from: '#3b82f6', to: '#1e40af' },
      position: 'bottom-right',
      hideOnPages: ['/contact'],
      enabled: true
    },

    // 💡 Example: Scroll to Top Button
    /*
    {
      id: 'scroll-top',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ),
      text: '',
      tooltip: 'العودة للأعلى',
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      colors: { from: '#f59e0b', to: '#d97706' },
      position: 'bottom-right',
      hideOnPages: [],
      enabled: false
    },
    */

    // 💡 Add more buttons here...
  ];

  // Show buttons after page loads
  useEffect(() => {
    const timers = buttons.map((button, index) => {
      if (button.enabled) {
        return setTimeout(() => {
          setLoadedButtons((prev) => ({ ...prev, [button.id]: true }));
        }, 1000 + index * 200); // Stagger animations
      }
      return null;
    });

    return () => timers.forEach((timer) => timer && clearTimeout(timer));
  }, []);

  // Filter enabled and visible buttons
  const visibleButtons = buttons.filter(
    (button) =>
      button.enabled &&
      !button.hideOnPages?.includes(location.pathname)
  );

  // Group buttons by position
  const groupedButtons = visibleButtons.reduce((acc, button) => {
    const pos = button.position || 'bottom-left';
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(button);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(groupedButtons).map(([position, posButtons]) => (
        <div
          key={position}
          className={`fixed ${getPositionClasses(position)} z-[9999] flex ${
            position.includes('left') ? 'flex-col-reverse' : 'flex-col-reverse'
          } gap-10`}
        >
          {posButtons.map((button) => (
            <FloatingButton
              key={button.id}
              button={button}
              isVisible={loadedButtons[button.id]}
            />
          ))}
        </div>
      ))}
    </>
  );
};

// ==========================================
// 🎯 Individual Floating Button Component
// ==========================================
const FloatingButton = ({ button, isVisible }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationDelay] = useState(Math.random() * 2);

  const handleClick = (e) => {
    if (button.onClick) {
      e.preventDefault();
      button.onClick();
    }
  };

  const ButtonContent = () => (
    <div
      className={`relative group transition-all duration-500 animate-float ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${animationDelay}s`
      }}
    >
      {/* Pulse Animation Ring */}
      <div
        className="absolute -inset-1.5 rounded-full opacity-75 group-hover:opacity-100 animate-pulse"
        style={{
          background: `linear-gradient(to right, ${button.colors.from}, ${button.colors.to})`
        }}
      ></div>

      {/* Main Button - Smaller Size */}
      <button
        onClick={handleClick}
        className="relative flex items-center gap-2 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 group"
        style={{
          background: `linear-gradient(to right, ${button.colors.from}, ${button.colors.to})`
        }}
      >
        {/* Icon - Smaller */}
        <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full">
          {typeof button.icon === 'string' ? (
            <span className="text-sm">{button.icon}</span>
          ) : (
            <div style={{ color: button.colors.to }}>{button.icon}</div>
          )}
        </div>

        {/* Text - Shows on hover */}
        {button.text && (
          <span
            className={`font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
              isHovered ? 'max-w-[150px] opacity-100' : 'max-w-0 opacity-0 overflow-hidden'
            }`}
          >
            {button.text}
          </span>
        )}
      </button>

      {/* Tooltip */}
      {button.tooltip && (
        <div
          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
            {button.tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render with Link or onClick
  if (button.link && !button.onClick) {
    if (button.external) {
      return (
        <a href={button.link} target="_blank" rel="noopener noreferrer">
          <ButtonContent />
        </a>
      );
    }
    return (
      <Link to={button.link}>
        <ButtonContent />
      </Link>
    );
  }

  return <ButtonContent />;
};

// ==========================================
// 🎨 Helper: Get Position Classes
// ==========================================
const getPositionClasses = (position) => {
  const positions = {
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'top-left': 'top-24 left-6',
    'top-right': 'top-24 right-6',
    'middle-left': 'top-1/2 -translate-y-1/2 left-6',
    'middle-right': 'top-1/2 -translate-y-1/2 right-6'
  };
  return positions[position] || positions['bottom-left'];
};

export default FloatingButtons;

// ==========================================
// 🎨 Floating Animation CSS
// ==========================================
// Add this to your global CSS or inline styles
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-6px);
    }
  }
  
  .animate-float {
    animation: float 2.5s ease-in-out infinite;
  }
`;

if (typeof document !== 'undefined' && !document.querySelector('#floating-buttons-style')) {
  style.id = 'floating-buttons-style';
  document.head.appendChild(style);
}