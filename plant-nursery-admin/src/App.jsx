import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NurseriesManager from './pages/NurseriesManager';
import OffersManager from './pages/OffersManager';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!user) return <Login onLogin={() => {}} />;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar or Top Nav */}
        <nav className="bg-white shadow-lg p-4">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between">
            <h1 className="text-2xl font-bold text-green-800">لوحة التحكم</h1>
            <ul className="flex space-x-1 space-x-reverse">
              <li><Link to="/" className="px-4 py-2 text-sm font-medium rounded hover:bg-green-100">الرئيسية</Link></li>
              <li><Link to="/nurseries" className="px-4 py-2 text-sm font-medium rounded hover:bg-green-100">المشاتل</Link></li>
              <li><Link to="/offers" className="px-4 py-2 text-sm font-medium rounded hover:bg-green-100">العروض</Link></li>
            </ul>
            <button
              onClick={() => auth.signOut()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
            >
              تسجيل الخروج
            </button>
          </div>
        </nav>

        <main className="py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nurseries" element={<NurseriesManager />} />
            <Route path="/offers" element={<OffersManager />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;