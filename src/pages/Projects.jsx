import React, { useState, useEffect } from 'react';
import { Code2, Plus, Edit3, Trash2, X, Lock, Loader2, Paperclip } from 'lucide-react';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin Auth States
  const [isEditing, setIsEditing] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Add/Edit Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image Upload States
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '', category: '', description: '', image: '', tech: '', liveLink: '', adminLink: ''
  });

  const API_URL = 'https://portfolio-backend-31zk.vercel.app';
  // const API_URL = 'http://localhost:5000';

  // 1. Fetch Data & Check Auth Token
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/projects`);
        if (res.data.success) setProjects(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const verifyToken = async () => {
      const token = localStorage.getItem('admin_jwt_token');
      if (token) {
        try {
          await axios.get(`${API_URL}/api/auth/verify`, { headers: { Authorization: `Bearer ${token}` } });
          setIsEditing(true);
        } catch (error) {
          localStorage.removeItem('admin_jwt_token');
        }
      }
    };

    fetchProjects();
    verifyToken();
  }, []);

  // 2. Secret Login Logic
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const handleSecretClick = () => {
    setClickCount(prev => {
      if (prev + 1 === 5) { setShowAuthModal(true); return 0; }
      return prev + 1;
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { passcode });
      if (res.data.success) {
        localStorage.setItem('admin_jwt_token', res.data.token);
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

  // 3. Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgData = new FormData();
    imgData.append('image', file);
    setUploadingImage(true);

    try {
      const res = await axios.post(`${API_URL}/api/upload`, imgData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log("API Response:", res.data); // Debugging ke liye

      // Yahan res.data.imageUrl use karna hai jo backend bhej raha hai
      if (res.data.imageUrl) {
        setFormData({ ...formData, image: res.data.imageUrl });
      }
    } catch (error) {
      alert('Image upload failed! ' + error.message);
    } finally {
      setUploadingImage(false);
    }
};

  // 4. Form Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenAdd = () => {
    setIsUpdating(false);
    setFormData({ title: '', category: '', description: '', image: '', tech: '', liveLink: '', adminLink: '' });
    setShowFormModal(true);
  };

  const handleOpenEdit = (project) => {
    setIsUpdating(true);
    setCurrentId(project._id);
    setFormData({
      title: project.title,
      category: project.category,
      description: project.description,
      image: project.image,
      tech: project.tech.join(', '), // Array to comma string
      liveLink: project.liveLink || '',
      adminLink: project.adminLink || ''
    });
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const token = localStorage.getItem('admin_jwt_token');
        await axios.delete(`${API_URL}/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setProjects(projects.filter(p => p._id !== id));
      } catch (error) {
        alert("Delete failed.");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('admin_jwt_token');
      const payload = {
        ...formData,
        tech: formData.tech.split(',').map(t => t.trim()).filter(t => t !== '')
      };

      if (isUpdating) {
        const res = await axios.put(`${API_URL}/api/projects/${currentId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setProjects(projects.map(p => p._id === currentId ? res.data.data : p));
      } else {
        const res = await axios.post(`${API_URL}/api/projects`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setProjects([...projects, res.data.data]);
      }
      setShowFormModal(false);
    } catch (error) {
      alert("Error saving project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fafcff]"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="bg-[#fafcff] min-h-screen font-sans selection:bg-blue-200 selection:text-blue-900 pb-16 md:pb-24 relative">
      
      {/* EDIT MODE FLOATING BADGE */}
      {isEditing && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 bg-slate-900 text-white p-3 md:p-4 rounded-2xl shadow-2xl flex items-center gap-3 md:gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 font-bold text-sm md:text-base">
            <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span></span>
            Edit Mode
          </div>
          <button onClick={handleLogout} className="bg-white/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors">Exit</button>
        </div>
      )}

      {/* HEADER SECTION - Responsive Text & Paddings */}
      <section className="pt-24 md:pt-32 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center mb-10 md:mb-16 relative">
        <div className="absolute top-10 right-1/4 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-blue-400/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-[10px] md:text-xs tracking-wide uppercase mb-4 md:mb-6">
          <Code2 size={14} className="md:w-4 md:h-4" /> Selected Works
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter mb-4 md:mb-6 relative z-10">
          Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Projects<span onClick={handleSecretClick} className="cursor-default text-transparent select-none">.</span></span>
        </h1>
        <p className="text-base md:text-xl text-slate-500 max-w-2xl font-medium relative z-10 mb-6 md:mb-8">
          A collection of my recent work, showcasing full-stack web applications, seamless user interfaces, and robust backend architectures.
        </p>

        {isEditing && (
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 md:px-6 md:py-3.5 rounded-xl text-sm md:text-base font-bold shadow-lg shadow-slate-900/20 transition-all z-20">
            <Plus size={18} className="md:w-5 md:h-5" /> Add New Project
          </button>
        )}
      </section>

      {/* PROJECTS GRID - Mobile Responsive (flex-wrap) */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto">
        {projects.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-medium text-base md:text-lg">No projects found. Add some!</div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {projects.map(project => (
              <div key={project._id} className="relative group/edit">
                
                {/* ADMIN CONTROLS OVERLAY - Mobile pe humesha dikhenge (opacity-100) */}
                {isEditing && (
                  <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-100 md:opacity-0 md:group-hover/edit:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit(project)} className="bg-blue-50 text-blue-600 p-2 md:p-2.5 rounded-xl hover:bg-blue-600 hover:text-white shadow-sm transition-colors"><Edit3 size={16} className="md:w-5 md:h-5" /></button>
                    <button onClick={() => handleDelete(project._id)} className="bg-red-50 text-red-500 p-2 md:p-2.5 rounded-xl hover:bg-red-500 hover:text-white shadow-sm transition-colors"><Trash2 size={16} className="md:w-5 md:h-5" /></button>
                  </div>
                )}
                
                {/* ProjectCard ko props pass kiye */}
                <ProjectCard {...project} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- HIDDEN ADMIN AUTH MODAL --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] p-6 md:p-12 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={18} className="md:w-5 md:h-5" /></button>
            <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-5 md:mb-6"><Lock size={28} className="text-white md:w-8 md:h-8" /></div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Restricted Access</h3>
            <form onSubmit={handleLogin}>
              <div className="mb-5 md:mb-6">
                <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Secret code" autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 md:px-5 md:py-4 text-center font-bold tracking-widest outline-none focus:ring-4 focus:border-blue-500 mt-3 md:mt-4 text-sm md:text-base" />
                {authError && <p className="text-red-500 text-xs md:text-sm mt-2 md:mt-3 font-bold text-center">{authError}</p>}
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 md:py-4 rounded-xl text-sm md:text-base">Authenticate</button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT PROJECT MODAL (Compact & Scrollable) --- */}
      {showFormModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-300 hide-scrollbar">
            
            <button onClick={() => setShowFormModal(false)} className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
              <X size={18} className="md:w-5 md:h-5" />
            </button>
            
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-5 tracking-tight">{isUpdating ? 'Edit Project' : 'Add New Project'}</h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-3 md:space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1">Project Title *</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 md:px-4 md:py-3 outline-none focus:border-blue-500 text-xs md:text-sm" placeholder="e.g. Utsav Events" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1">Category *</label>
                  <input type="text" name="category" required value={formData.category} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 md:px-4 md:py-3 outline-none focus:border-blue-500 text-xs md:text-sm" placeholder="e.g. Full-Stack Web App" />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1">Description *</label>
                <textarea name="description" required rows="2" value={formData.description} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 md:px-4 md:py-3 outline-none focus:border-blue-500 resize-none text-xs md:text-sm" placeholder="Briefly describe the project..."></textarea>
              </div>

              {/* Dynamic Image Upload */}
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1">Project Image *</label>
                <div className="flex items-center gap-2">
                  <input type="file" id="project-image" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <label htmlFor="project-image" className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm text-slate-500 cursor-pointer transition-colors w-full">
                    {uploadingImage ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Paperclip size={16} className={formData.image ? "text-emerald-500" : "text-slate-400"} />}
                    <span className="font-medium truncate">
                      {uploadingImage ? "Uploading..." : formData.image ? "Image Ready (Click to change)" : "Upload Image"}
                    </span>
                  </label>
                </div>
                {formData.image && !uploadingImage && (
                  <input type="text" value={formData.image} readOnly className="w-full mt-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-[10px] md:text-xs text-slate-500 outline-none" />
                )}
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1">Tech Stack (Comma Separated) *</label>
                <input type="text" name="tech" required value={formData.tech} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 md:px-4 md:py-3 outline-none focus:border-blue-500 text-xs md:text-sm" placeholder="React, Node.js, Tailwind CSS" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1">Live Link</label>
                  <input type="url" name="liveLink" value={formData.liveLink} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 md:px-4 md:py-3 outline-none focus:border-blue-500 text-xs md:text-sm" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1">Admin Link (Optional)</label>
                  <input type="url" name="adminLink" value={formData.adminLink} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 md:px-4 md:py-3 outline-none focus:border-blue-500 text-xs md:text-sm" placeholder="https://..." />
                </div>
              </div>

              <div className="pt-2 md:pt-3 border-t border-slate-100">
                <button 
                  type="submit" 
                  disabled={isSubmitting || uploadingImage}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 md:py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 text-sm md:text-base ${(isSubmitting || uploadingImage) ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Saving...' : 'Save Project'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;