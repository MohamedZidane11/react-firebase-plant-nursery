import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Nurseries from './pages/Nurseries'
import NurseryDetail from './pages/NurseryDetail';
import Offers from './pages/Offers';
import Contact from './pages/Contact';
import RegisterNursery from './components/RegisterNursery';
import OfferDetail from './pages/OfferDetail';
import Survey from './pages/Survey';

// ✅ Scroll To Top Wrapper
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <main>
          <ScrollToTop />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/nurseries" element={<Nurseries />} />
            <Route path="/nurseries/:id" element={<NurseryDetail />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/offers/:id" element={<OfferDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register" element={<RegisterNursery />} />
            <Route path="/survey" element={<Survey />} />
          </Routes>

        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;