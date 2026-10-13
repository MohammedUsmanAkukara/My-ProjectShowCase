import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { Loader2 } from 'lucide-react';

// Lazy load all pages for better performance (code splitting)
const Home      = lazy(() => import('./pages/Home'));
const About     = lazy(() => import('./pages/About'));
const Services  = lazy(() => import('./pages/Services'));
const Projects  = lazy(() => import('./pages/Projects'));
const Contact   = lazy(() => import('./pages/Contact'));
const Clients   = lazy(() => import('./pages/Clients'));
const Invoices  = lazy(() => import('./pages/Invoices'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#fafcff]">
    <Loader2 className="animate-spin text-blue-600" size={40} />
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col font-sans selection:bg-blue-200 selection:text-blue-900 text-slate-900">
        <Header />
        <div className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"          element={<Home />} />
              <Route path="/about"     element={<About />} />
              <Route path="/services"  element={<Services />} />
              <Route path="/projects"  element={<Projects />} />
              <Route path="/contact"   element={<Contact />} />
              <Route path="/clients"   element={<Clients />} />
              <Route path="/invoices"  element={<Invoices />} />
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;