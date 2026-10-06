import React, { useState, useEffect } from 'react';
import { 
  Globe, Database, Layout, Rocket, ArrowRight, Server, Code2, 
  Edit3, Plus, X, Lock, Loader2, Trash2, Smartphone, PenTool, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// --- DYNAMIC ICON COMPONENT ---
// Ye string name leta hai aur asli Lucide Icon return karta hai
const IconRenderer = ({ iconName, size = 32, strokeWidth = 1.5 }) => {
  const icons = {
    Globe: <Globe size={size} strokeWidth={strokeWidth} />,
    Layout: <Layout size={size} strokeWidth={strokeWidth} />,
    Database: <Database size={size} strokeWidth={strokeWidth} />,
    Rocket: <Rocket size={size} strokeWidth={strokeWidth} />,
    Server: <Server size={size} strokeWidth={strokeWidth} />,
    Code2: <Code2 size={size} strokeWidth={strokeWidth} />,
    Smartphone: <Smartphone size={size} strokeWidth={strokeWidth} />,
    PenTool: <PenTool size={size} strokeWidth={strokeWidth} />,
    Search: <Search size={size} strokeWidth={strokeWidth} />
  };
  return icons[iconName] || <Code2 size={size} strokeWidth={strokeWidth} />;
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ADMIN AUTH STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // --- ADD/EDIT MODAL STATES ---
  const [showFormModal, setShowFormModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // check agar purana service edit ho raha hai
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', iconName: 'Globe', color: 'text-blue-500', bgColor: 'bg-blue-50', tags: ''
  });

  // 1. Fetch Data & Verify Token
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/services');
        if (response.data.success) {
          setServices(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    const verifyToken = async () => {
      const token = localStorage.getItem('admin_jwt_token');
      if (token) {
        try {
          await axios.get('http://localhost:5000/api/auth/verify', {
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
    setAuthError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { passcode });
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

  // 3. Form Handlers (Add, Edit, Delete)
  const handleOpenAdd = () => {
    setIsUpdating(false);
    setFormData({ title: '', description: '', iconName: 'Globe', color: 'text-blue-500', bgColor: 'bg-blue-50', tags: '' });
    setShowFormModal(true);
  };

  const handleOpenEdit = (service) => {
    setIsUpdating(true);
    setCurrentId(service._id);
    setFormData({
      title: service.title,
      description: service.description,
      iconName: service.iconName,
      color: service.color,
      bgColor: service.bgColor,
      tags: service.tags.join(', ') // Array to comma-separated string
    });
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        const token = localStorage.getItem('admin_jwt_token');
        await axios.delete(`http://localhost:5000/api/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setServices(services.filter(s => s._id !== id));
      } catch (error) {
        alert("Failed to delete.");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_jwt_token');
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(t => t !== '')
      };

      if (isUpdating) {
        // Update API
        const response = await axios.put(`http://localhost:5000/api/services/${currentId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setServices(services.map(s => s._id === currentId ? response.data.data : s));
      } else {
        // Add API
        const response = await axios.post('http://localhost:5000/api/services', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setServices([...services, response.data.data]);
      }
      setShowFormModal(false);
    } catch (error) {
      alert("Error saving service");
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

      {/* 1. PAGE HEADER */}
      <section className="pt-32 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center mb-16 relative">
        <div className="absolute top-10 right-1/3 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none"></div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 relative z-10">
          What I <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Bring to the Table
            {/* HIDDEN SECRET TRIGGER (.) */}
            <span onClick={handleSecretClick} className="cursor-default text-slate-900 select-none">.</span>
          </span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl font-medium relative z-10 mb-8">
          Comprehensive digital solutions built with modern technologies, focusing on performance, scalability, and exceptional user experience.
        </p>

        {/* ADD NEW SERVICE BUTTON (Visible only to Admin) */}
        {isEditing && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all z-20"
          >
            <Plus size={20} /> Add New Service
          </button>
        )}
      </section>

      {/* 2. SERVICES GRID (Dynamic) */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-24">
        {services.length === 0 ? (
           <div className="text-center text-slate-500 font-medium text-lg mt-10">
             No services found. Log in to add some!
           </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service._id} className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 group hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full relative">
                
                {/* ADMIN CARD CONTROLS */}
                {isEditing && (
                  <div className="absolute top-6 right-6 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit(service)} className="bg-blue-50 text-blue-600 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(service._id)} className="bg-red-50 text-red-500 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={18} /></button>
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl ${service.bgColor} ${service.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  <IconRenderer iconName={service.iconName} />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
                  {service.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed text-lg mb-8 flex-grow font-medium">
                  {service.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-slate-100">
                  {service.tags.map((tag, index) => (
                    <span key={index} className="text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. WORKFLOW / TECH HIGHLIGHT */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-24">
        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
          <div className="absolute -left-20 top-0 w-64 h-64 bg-blue-600/30 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">Need a Custom Solution?</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Whether you need a dynamic retail inventory dashboard or a high-performance e-commerce backend, I architect systems that align perfectly with your business goals.
            </p>
            <Link to="/contact" className="group bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all inline-flex items-center gap-3 shadow-lg shadow-blue-600/30">
              Request a Quote <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="relative z-10 md:w-1/2 grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col items-center text-center">
              <Server className="text-blue-400 mb-3" size={32} />
              <span className="text-white font-semibold">Scalable</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col items-center text-center mt-8">
              <Code2 className="text-emerald-400 mb-3" size={32} />
              <span className="text-white font-semibold">Clean Code</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- HIDDEN ADMIN AUTH MODAL --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={20} /></button>
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6"><Lock size={32} className="text-white" /></div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Restricted Access</h3>
            <p className="text-slate-500 font-medium mb-8">Enter the master code to authenticate.</p>
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Secret code" autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-center font-bold tracking-widest outline-none focus:ring-4 focus:border-blue-500" />
                {authError && <p className="text-red-500 text-sm mt-3 font-bold text-center">{authError}</p>}
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl">Authenticate</button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT SERVICE MODAL --- */}
      {showFormModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in hide-scrollbar">
            <button onClick={() => setShowFormModal(false)} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-slate-900 mb-5">{isUpdating ? 'Edit Service' : 'Add New Service'}</h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm" required />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 resize-none text-sm" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">Icon Name</label>
                  <select value={formData.iconName} onChange={(e) => setFormData({...formData, iconName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm">
                    <option value="Globe">Globe (Web)</option>
                    <option value="Layout">Layout (UI)</option>
                    <option value="Database">Database</option>
                    <option value="Rocket">Rocket (Deploy)</option>
                    <option value="Server">Server</option>
                    <option value="Code2">Code</option>
                    <option value="Smartphone">Mobile</option>
                    <option value="PenTool">Design</option>
                    <option value="Search">Search (SEO)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">Text Color Class</label>
                  <input type="text" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm" placeholder="text-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">Bg Color Class</label>
                  <input type="text" value={formData.bgColor} onChange={(e) => setFormData({...formData, bgColor: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm" placeholder="bg-blue-50" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">Tags (Comma Separated)</label>
                <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm" placeholder="React, MySQL, SEO" required />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg">
                  {isUpdating ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Services;