import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Nurseries from './pages/Nurseries'
import NurseryDetail from './pages/NurseryDetail';
import Offers from './pages/Offers';
import Contact from './pages/Contact';
import RegisterNursery from './components/RegisterNursery';
import OfferDetail from './pages/OfferDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/nurseries" element={<Nurseries />} />
            <Route path="/nurseries/:id" element={<NurseryDetail />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/offers/:id" element={<OfferDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register" element={<RegisterNursery />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;