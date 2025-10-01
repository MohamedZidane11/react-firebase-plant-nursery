// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebase';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NurseriesManager from './pages/NurseriesManager';
import NurseryForm from './pages/NurseryForm';
import OffersManager from './pages/OffersManager';
import CategoriesManager from './pages/CategoriesManager';
import FiltersManager from './pages/FiltersManager';
import SponsorsManager from './pages/SponsorsManager';
import SiteSettings from './pages/SiteSettings';
import PendingNurseriesManager from './pages/PendingNurseriesManager';

// Import Header
import AdminHeader from './components/AdminHeader';

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
        {/* ✅ Use extracted header */}
        <AdminHeader />

        {/* Main Content */}
        <main className="pt-28 pb-8 px-4 md:px-6"> {/* Added top padding for sticky header */}
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/nurseries" element={<NurseriesManager />} />
              <Route path="/nurseries/add" element={<NurseryForm />} />
              <Route path="/nurseries/edit/:id" element={<NurseryForm />} />
              <Route path="/offers" element={<OffersManager />} />
              <Route path="/categories" element={<CategoriesManager />} />
              <Route path="/filters" element={<FiltersManager />} />
              <Route path="/sponsors" element={<SponsorsManager />} />
              <Route path="/pending-nurseries" element={<PendingNurseriesManager />} />
              <Route path="/settings" element={<SiteSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;