import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Admin & Modal States
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Project Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    image: '',
    tech: '', // Frontend par comma-separated string lenge
    liveLink: '',
    adminLink: ''
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgData = new FormData();
    imgData.append('image', file);

    setUploadingImage(true);
    try {
      // Backend par image bhejna
      const res = await axios.post('https://portfolio-backend-31zk.vercel.app/api/upload', imgData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        // Backend se jo URL aaya, usko direct form data me set kar diya
        setFormData({ ...formData, image: res.data.url });
      }
    } catch (error) {
      console.error(error);
      alert('Image upload failed!');
    } finally {
      setUploadingImage(false);
    }
  };

  // 1. Fetch Projects from Backend API & Check Admin Token
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('https://portfolio-backend-31zk.vercel.app/api/projects');
        if (response.data.success) {
          setProjects(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    // Check auth status
    const token = localStorage.getItem('admin_jwt_token');
    if (token) {
      setIsEditing(true);
    }

    fetchProjects();
  }, []);

  // 2. Handle Form Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle Add New Project Submit
  const handleAddProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('admin_jwt_token');

      // Tech string ("React, Node") ko Array (["React", "Node"]) me convert karna
      const techArray = formData.tech.split(',').map((item) => item.trim()).filter(item => item !== "");

      const payload = {
        ...formData,
        tech: techArray
      };

      const response = await axios.post('https://portfolio-backend-31zk.vercel.app/api/projects', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Naye project ko existing state me sabse aage add kar do
        setProjects([response.data.data, ...projects]);

        // Modal close aur form reset
        setShowAddModal(false);
        setFormData({
          title: '', category: '', description: '', image: '', tech: '', liveLink: '', adminLink: ''
        });
      }
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add project. Ensure all required fields are filled.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fafcff] min-h-screen font-sans selection:bg-blue-200 selection:text-blue-900 pb-24 relative">

      {/* 1. PAGE HEADER */}
      <section className="pt-32 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center mb-16 relative">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-[600px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-slate-200/60 shadow-sm text-slate-600 font-medium text-sm mb-8">
          <Sparkles size={16} className="text-blue-500" />
          <span>Showcase of my best builds</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 relative z-10">
          Selected <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Works.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl font-medium mb-8">
          Dive into my recent projects. From complex relational databases to pixel-perfect reactive interfaces, here is what I've been building.
        </p>

        {/* --- ADD PROJECT BUTTON (Visible only to Admin) --- */}
        {isEditing && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-1 z-20"
          >
            <Plus size={20} /> Add New Project
          </button>
        )}
      </section>

      {/* 2. PROJECTS GALLERY */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto min-h-[400px]">
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
            <Loader2 size={40} className="animate-spin text-blue-500" />
            <p className="font-semibold text-lg">Loading database...</p>
          </div>
        ) : projects.length === 0 ? (
          // Empty State
          <div className="text-center text-slate-500 font-medium text-lg mt-10">
            No projects found. Log in to add some!
          </div>
        ) : (
          // Projects Render
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-12">
            {projects.map((project) => (
              <div key={project._id} className="flex h-full relative">
                <ProjectCard
                  title={project.title}
                  category={project.category}
                  description={project.description}
                  image={project.image}
                  tech={project.tech}
                  liveLink={project.liveLink}
                  adminLink={project.adminLink}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. GITHUB CTA */}
      <section className="px-6 lg:px-8 max-w-4xl mx-auto mt-24">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 text-center sm:text-left">
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Want to see the code?</h3>
            <p className="text-slate-400 font-medium">
              Check out my GitHub for more open-source projects, scripts, and CTF challenges.
            </p>
          </div>

          <a
            href="https://github.com/blindhumain" // Optional: aapka username agar yahi hai
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-2xl font-bold transition-all shadow-md hover:shadow-xl hover:-translate-y-1 whitespace-nowrap"
          >
            {/* <Github size={20} /> */}
            Visit GitHub
          </a>
        </div>
      </section>

      {/* --- ADD NEW PROJECT MODAL (Compact & Scrollable) --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">

          {/* Main Modal Box - Added max-h-[90vh] and overflow-y-auto */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-300 hide-scrollbar">

            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-5 tracking-tight">Add New Project</h2>

            <form onSubmit={handleAddProject} className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">Project Title *</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm" placeholder="e.g. Utsav Events" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">Category *</label>
                  <input type="text" name="category" required value={formData.category} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm" placeholder="e.g. Full-Stack Web App" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">Description *</label>
                {/* Textarea rows reduced from 3 to 2 to save vertical space if needed, keeping 3 for now but with smaller padding */}
                <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none text-sm" placeholder="Briefly describe the project..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">Project Image *</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-blue-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  // Form tabhi submit hoga jab image upload ho chuki hogi
                  required={!formData.image}
                />

                {/* Upload Status Indicators */}
                {uploadingImage && (
                  <p className="text-xs text-blue-500 mt-2 flex items-center gap-1 font-semibold">
                    <Loader2 size={12} className="animate-spin" /> Uploading image to server...
                  </p>
                )}
                {!uploadingImage && formData.image && (
                  <p className="text-xs text-emerald-500 mt-2 font-semibold">
                    ✓ Image ready! ({formData.image})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">Tech Stack (Comma Separated) *</label>
                <input type="text" name="tech" required value={formData.tech} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm" placeholder="React, Node.js, Tailwind CSS" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">Live Link</label>
                  <input type="url" name="liveLink" value={formData.liveLink} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">Admin Link (Optional)</label>
                  <input type="url" name="adminLink" value={formData.adminLink} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm" placeholder="https://..." />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Saving to Database...' : 'Save Project'}
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