import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';

import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import FloatingButtons from './components/FloatingButtons';

import Home from './pages/Home';
import Nurseries from './pages/Nurseries'
import NurseryDetail from './pages/NurseryDetail';
import Offers from './pages/Offers';
import Contact from './pages/Contact';
import RegisterNursery from './components/RegisterNursery';
import OfferDetail from './pages/OfferDetail';
import Survey from './pages/Survey';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import AboutUs from './pages/AboutUs';
import FAQ from './pages/FAQ';


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
    <HelmetProvider>
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
              <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
              <Route path="/TermsOfUse" element={<TermsOfUse />} />
              <Route path="/AboutUs" element={<AboutUs />} />
              <Route path="/FAQ" element={<FAQ />} />
            </Routes>

          </main>
          
          <Footer />
          <FloatingButtons />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;