import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Dumbbell, 
  Gamepad2, 
  MonitorPlay,
  Terminal,
  Edit3,
  X,
  Loader2,
  Plus,
  Trash2,
  Lock
} from 'lucide-react';
import axios from 'axios';

const About = () => {
  // --- STATES ---
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // --- SECRET ADMIN STATES (NEW IN ABOUT PAGE) ---
  const [clickCount, setClickCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // --- EDIT MODAL STATES ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    education: '',
    experiences: []
  });

  // 1. Fetch Data & Check Auth Token
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://portfolio-backend-31zk.vercel.app/api/about');
        if (response.data.success) {
          setAboutData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching about data:", error);
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

  // 2. Secret Login Logic (5 Clicks)
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
    setIsAuthLoading(true);
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
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_jwt_token');
    setIsEditing(false);
  };

  // 3. Open Edit Modal with Current Data
  const handleOpenEdit = () => {
    setFormData({
      bio: aboutData.bio,
      location: aboutData.location,
      education: aboutData.education,
      experiences: [...aboutData.experiences]
    });
    setShowEditModal(true);
  };

  // 4. Handle Form Changes (Experience Array)
  const handleExpChange = (index, field, value) => {
    const newExps = [...formData.experiences];
    newExps[index][field] = value;
    setFormData({ ...formData, experiences: newExps });
  };

  const addExperience = () => {
    setFormData({ 
      ...formData, 
      experiences: [...formData.experiences, { title: '', period: '' }] 
    });
  };

  const removeExperience = (index) => {
    const newExps = formData.experiences.filter((_, i) => i !== index);
    setFormData({ ...formData, experiences: newExps });
  };

  // 5. Save Updates to Backend
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_jwt_token');
      const response = await axios.put('https://portfolio-backend-31zk.vercel.app/api/about', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAboutData(response.data.data);
        setShowEditModal(false);
        alert("About details updated successfully! 🚀");
      }
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || "Failed to update"}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fafcff]"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  return (
    <div className="bg-[#fafcff] min-h-screen font-sans selection:bg-blue-200 selection:text-blue-900 pb-24 relative">
      
      {/* EDIT MODE FLOATING BADGE */}
      {isEditing && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 font-bold">
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
            Edit Mode Active
          </div>
          <button onClick={handleLogout} className="bg-white/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">Exit</button>
        </div>
      )}

      {/* 1. HEADER SECTION */}
      <section className="pt-32 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center mb-16 relative">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-[100px] pointer-events-none"></div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 relative z-10">
          Behind the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Code
            {/* HIDDEN SECRET TRIGGER (.) */}
            <span onClick={handleSecretClick} className="cursor-default text-slate-900 select-none">.</span>
          </span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl font-medium relative z-10">
          A glimpse into my journey, experience, and what keeps me inspired both on and off the screen.
        </p>
      </section>

      {/* 2. BENTO GRID CONTENT */}
      {aboutData && (
        <section className="px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto relative">
          
          {/* Main Bio Card */}
          <div className="md:col-span-2 bg-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 group hover:border-blue-100 transition-colors duration-500 relative">
            
            {/* --- ADMIN EDIT BUTTON (Now perfectly positioned top right of this card) --- */}
            {isEditing && (
              <button 
                onClick={handleOpenEdit} 
                className="absolute top-6 right-6 z-20 bg-blue-50 hover:bg-blue-600 hover:text-white p-3 rounded-full text-blue-600 transition-all cursor-pointer shadow-sm"
                title="Edit About Section"
              >
                <Edit3 size={20} />
              </button>
            )}

            <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Hi, I'm Mohammed Usman.</h2>
            <div className="space-y-4 text-slate-600 text-lg leading-relaxed font-medium whitespace-pre-line pr-10">
              {aboutData.bio}
            </div>
          </div>

          {/* Quick Facts Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-center relative overflow-hidden">
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/30 blur-[40px] rounded-full"></div>
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md"><MapPin size={24} className="text-blue-400" /></div>
                    <div>
                      <span className="block text-sm text-slate-400 font-semibold">Location</span>
                      <span className="block font-bold text-lg">{aboutData.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md"><GraduationCap size={24} className="text-blue-400" /></div>
                    <div>
                      <span className="block text-sm text-slate-400 font-semibold">Education</span>
                      <span className="block font-bold text-lg">{aboutData.education}</span>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-grow">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Briefcase className="text-blue-600" size={24} /> Experience
              </h3>
              <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
                
                {/* Dynamic Experience Rendering */}
                {aboutData.experiences.map((exp, idx) => (
                  <div key={idx} className="relative">
                    <span className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white ${idx === 0 ? 'bg-blue-600 shadow-sm' : 'bg-slate-300'}`}></span>
                    <h4 className="font-bold text-slate-900">{exp.title}</h4>
                    <p className="text-sm text-slate-500 font-medium">{exp.period}</p>
                  </div>
                ))}

              </div>
            </div>
          </div>

          {/* Off the clock / Hobbies Section */}
          <div className="md:col-span-3 bg-gradient-to-br from-white to-slate-50 p-10 md:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mt-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">Off the Clock</h2>
            <div className="grid md:grid-cols-4 gap-6">
              
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <Dumbbell className="text-blue-600 mb-4" size={32} strokeWidth={1.5} />
                <h4 className="text-lg font-bold text-slate-900 mb-2">Fitness</h4>
                <p className="text-sm text-slate-500 font-medium">Dedicated to full-body strength training at home using dumbbells and resistance bands.</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <MonitorPlay className="text-indigo-500 mb-4" size={32} strokeWidth={1.5} />
                <h4 className="text-lg font-bold text-slate-900 mb-2">Content Creation</h4>
                <p className="text-sm text-slate-500 font-medium">Managing the 'BLINDHUMAIN' channel, producing and editing gaming montages.</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <Gamepad2 className="text-purple-500 mb-4" size={32} strokeWidth={1.5} />
                <h4 className="text-lg font-bold text-slate-900 mb-2">Gaming</h4>
                <p className="text-sm text-slate-500 font-medium">Active BGMI player focusing on tactical gameplay with a highly customized four-finger layout.</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <Terminal className="text-emerald-500 mb-4" size={32} strokeWidth={1.5} />
                <h4 className="text-lg font-bold text-slate-900 mb-2">Cybersecurity</h4>
                <p className="text-sm text-slate-500 font-medium">Solving CTF challenges, exploring Python scripting, and tinkering with reverse engineering.</p>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* --- HIDDEN ADMIN AUTH MODAL --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6"><Lock size={32} className="text-white" /></div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Restricted Access</h3>
            <p className="text-slate-500 font-medium mb-8">Enter the master code to authenticate.</p>
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Secret code" autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-center font-bold tracking-widest outline-none focus:ring-4 focus:border-blue-500" />
                {authError && <p className="text-red-500 text-sm mt-3 font-bold text-center">{authError}</p>}
              </div>
              <button type="submit" disabled={isAuthLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl">
                {isAuthLoading ? 'Verifying...' : 'Authenticate'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL (Compact & Scrollable) --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          
          {/* Main Modal Box - Added max-h-[90vh] and overflow-y-auto */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-300 hide-scrollbar">
            
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-5 tracking-tight">Edit About Details</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">Bio (Write paragraphs)</label>
                {/* Rows kam kar diye taaki height bache */}
                <textarea 
                  value={formData.bio} 
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows="4" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:border-blue-500 resize-none text-sm" 
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">Location</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:border-blue-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">Education</label>
                  <input type="text" value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:border-blue-500 text-sm" required />
                </div>
              </div>

              {/* Dynamic Experiences Area */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-bold text-slate-900">Experience Timeline</label>
                  <button type="button" onClick={addExperience} className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                    <Plus size={14} /> Add 
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.experiences.map((exp, index) => (
                    <div key={index} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex-1 space-y-2">
                        <input type="text" placeholder="Job Title" value={exp.title} onChange={(e) => handleExpChange(index, 'title', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                        <input type="text" placeholder="Time Period" value={exp.period} onChange={(e) => handleExpChange(index, 'period', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" required />
                      </div>
                      <button type="button" onClick={() => removeExperience(index)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30">
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default About;