import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-green-800 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v2" />
            </svg>
          </div>
          <span className="text-xl font-bold">منصة المشاتل</span>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="hover:text-yellow-300 transition-colors">الرئيسية</Link>
          <Link to="/nurseries" className="hover:text-yellow-300 transition-colors">المشاتل</Link>
          <Link to="/offers" className="hover:text-yellow-300 transition-colors">العروض</Link>
          <Link to="/contact" className="hover:text-yellow-300 transition-colors">اتصل بنا</Link>
        </nav>
        <Link to="/register">
        <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition-colors">
          سجل مشتلك
        </button>
        </Link>
      </div>
    </header>
  );
};

export default Header;