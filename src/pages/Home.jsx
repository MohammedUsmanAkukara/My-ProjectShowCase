import React, { useState, useEffect } from 'react';
import { ArrowRight, Edit3, X, Lock, Loader2, Download, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  // --- STATES ---
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- ADMIN AUTH STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // --- EDIT MODAL STATES ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', subtitle: '', ctaText: ''
  });

  // Fallback Data agar Database empty ho
  const fallbackData = {
    title: "Building Digital Experiences",
    subtitle: "I am a Full-Stack Web Developer & Designer specializing in building exceptional, high-performance web applications.",
    ctaText: "Explore My Work"
  };
  
  const displayData = homeData || fallbackData;

  // 1. Fetch Data & Check Auth Token
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://portfolio-backend-31zk.vercel.app/api/home');
        if (response.data.success && response.data.data) {
          setHomeData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    const verifyToken = async () => {
      const token = localStorage.getItem('admin_jwt_token');
      if (token) {
        try {
          await axios.get('https://portfolio-backend-31zk.vercel.app/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsEditing(true);
        } catch (error) {
          localStorage.removeItem('admin_jwt_token');
        }
      }
    };

    fetchData();
    verifyToken();
  }, []);

  // 2. Secret Login Logic (5 Clicks on ".")
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const handleSecretClick = () => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 5) {
        setShowAuthModal(true);
        return 0;
      }
      return newCount;
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await axios.post('https://portfolio-backend-31zk.vercel.app/api/auth/login', { passcode });
      if (response.data.success) {
        localStorage.setItem('admin_jwt_token', response.data.token);
        setIsEditing(true);
        setShowAuthModal(false);
        setPasscode('');
      }
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Access Denied.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_jwt_token');
    setIsEditing(false);
  };

  // 3. Edit Handlers
  const handleOpenEdit = () => {
    setFormData({
      title: displayData.title,
      subtitle: displayData.subtitle,
      ctaText: displayData.ctaText
    });
    setShowEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_jwt_token');
      const response = await axios.put('https://portfolio-backend-31zk.vercel.app/api/home', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setHomeData(response.data.data);
        setShowEditModal(false);
      }
    } catch (error) {
      alert("Failed to update home details.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fafcff]"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  return (
    <div className="bg-[#fafcff] min-h-screen font-sans selection:bg-blue-200 selection:text-blue-900 relative overflow-hidden flex flex-col justify-center">
      
      {/* EDIT MODE FLOATING BADGE */}
      {isEditing && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 bg-slate-900 text-white p-3 md:p-4 rounded-2xl shadow-2xl flex items-center gap-3 md:gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 font-bold text-sm md:text-base">
            <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span></span>
            Edit Mode Active
          </div>
          <button onClick={handleLogout} className="bg-white/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors">Exit</button>
        </div>
      )}

      {/* BACKGROUND GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-400/20 rounded-full blur-[100px] md:blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* HERO SECTION - Responsive layout */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full py-20 md:py-32 flex flex-col items-center md:items-start text-center md:text-left">
        
        {/* ADMIN EDIT BUTTON */}
        {isEditing && (
          <button 
            onClick={handleOpenEdit} 
            className="md:absolute md:top-32 md:right-8 mb-6 md:mb-0 bg-white shadow-lg border border-blue-100 p-3 rounded-full text-blue-600 hover:scale-110 transition-transform cursor-pointer flex items-center gap-2"
          >
            <Edit3 size={20} /> <span className="md:hidden font-bold text-sm">Edit Hero</span>
          </button>
        )}

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-xs md:text-sm tracking-wide uppercase mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Code2 size={16} /> Portfolio 2026
        </div>

        {/* Dynamic Title with Responsive Text Size */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[85px] font-black text-slate-900 tracking-tighter leading-[1.1] mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 max-w-4xl">
          {displayData.title.split(' ').slice(0, -1).join(' ')} <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            {displayData.title.split(' ').slice(-1)}
            {/* HIDDEN SECRET TRIGGER (.) */}
            <span onClick={handleSecretClick} className="cursor-default text-transparent select-none">.</span>
          </span>
        </h1>

        {/* Dynamic Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-500 font-medium max-w-2xl leading-relaxed mb-10 md:mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {displayData.subtitle}
        </p>

        {/* Action Buttons - Stack on mobile, inline on desktop */}
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Link 
            to="/projects" 
            className="w-full sm:w-auto group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-3 text-sm md:text-base"
          >
            {displayData.ctaText} 
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <a 
            href="/Resume.pdf" 
            target="_blank"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold transition-colors shadow-sm text-sm md:text-base"
          >
            Download CV <Download size={20} />
          </a>
        </div>

      </main>

      {/* --- HIDDEN ADMIN AUTH MODAL --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] p-6 md:p-12 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={18} className="md:w-5 md:h-5" /></button>
            <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-5 md:mb-6"><Lock size={28} className="text-white md:w-8 md:h-8" /></div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Admin Access</h3>
            <p className="text-sm md:text-base text-slate-500 font-medium mb-6 md:mb-8">Enter the master code to authenticate.</p>
            <form onSubmit={handleLogin}>
              <div className="mb-5 md:mb-6">
                <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Secret code" autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 md:px-5 md:py-4 text-center font-bold tracking-widest outline-none focus:ring-4 focus:border-blue-500 mt-2 text-sm md:text-base" />
                {authError && <p className="text-red-500 text-xs md:text-sm mt-2 font-bold text-center">{authError}</p>}
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 md:py-4 rounded-xl text-sm md:text-base">Authenticate</button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL (Compact & Responsive) --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in hide-scrollbar">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={18} className="md:w-5 md:h-5" /></button>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-5">Edit Home Page</h2>
            <form onSubmit={handleSave} className="space-y-4 md:space-y-5">
              
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1">Hero Title</label>
                <textarea rows="2" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm md:text-base resize-none" required />
                <p className="text-[10px] md:text-xs text-slate-400 mt-1">Last word will automatically be highlighted with a blue gradient.</p>
              </div>
              
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1">Subtitle</label>
                <textarea rows="3" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm md:text-base resize-none" required />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1">CTA Button Text</label>
                <input type="text" value={formData.ctaText} onChange={(e) => setFormData({...formData, ctaText: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm md:text-base" required />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg text-sm md:text-base">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;