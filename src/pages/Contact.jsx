import React, { useState, useEffect } from 'react';
import { 
  Mail, MapPin, Send, Paperclip, CheckCircle2, 
  X, Phone, Edit3, Lock, Loader2, Eye, Calendar, Download
} from 'lucide-react';
import axios from 'axios';

const Contact = () => {
  // --- STATES ---
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- ADMIN AUTH STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // --- EDIT INFO MODAL STATES ---
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [editInfoData, setEditInfoData] = useState({ email: '', location: '', status: '' });

  // --- INBOX MODAL STATES ---
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(false);

  // --- USER FORM STATES ---
  const [formData, setFormData] = useState({ name: '', email: '', message: '', attachmentUrl: '' });
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileName, setFileName] = useState('');

  const fallbackInfo = { email: "hello@mohammedusman.com", location: "Raipur, Chhattisgarh, India", status: "Available for hire" };
  const displayInfo = contactInfo || fallbackInfo;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://portfolio-backend-31zk.vercel.app/api/contact/info');
        if (response.data.success && response.data.data) setContactInfo(response.data.data);
      } catch (error) {
        console.error("Error fetching contact info:", error);
      } finally {
        setLoading(false);
      }
    };

    const verifyToken = async () => {
      const token = localStorage.getItem('admin_jwt_token');
      if (token) {
        try {
          await axios.get('https://portfolio-backend-31zk.vercel.app/api/auth/verify', { headers: { Authorization: `Bearer ${token}` } });
          setIsEditing(true);
        } catch (error) { localStorage.removeItem('admin_jwt_token'); }
      }
    };
    fetchData();
    verifyToken();
  }, []);

  // Secret Login Logic
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

  // Open Edit Modal
  const openEditInfoModal = () => {
    setEditInfoData(displayInfo);
    setShowEditInfoModal(true);
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_jwt_token');
      const response = await axios.put('https://portfolio-backend-31zk.vercel.app/api/contact/info', editInfoData, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        setContactInfo(response.data.data);
        setShowEditInfoModal(false);
      }
    } catch (error) { alert("Failed to update contact details"); }
  };

  // Open Inbox Modal
  const handleOpenInbox = async () => {
    setShowInboxModal(true);
    setLoadingInbox(true);
    try {
      const token = localStorage.getItem('admin_jwt_token');
      const response = await axios.get('https://portfolio-backend-31zk.vercel.app/api/contact/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setInboxMessages(response.data.data);
      }
    } catch (error) {
      alert("Failed to load messages");
    } finally {
      setLoadingInbox(false);
    }
  };

  // Form Handlers
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setUploadingFile(true);

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await axios.post('https://portfolio-backend-31zk.vercel.app/api/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) setFormData({ ...formData, attachmentUrl: res.data.url });
    } catch (error) {
      alert('File upload failed!');
      setFileName('');
    } finally { setUploadingFile(false); }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await axios.post('https://portfolio-backend-31zk.vercel.app/api/contact/message', formData);
        if (response.data.success) {
          setIsModalOpen(true);
          setFormData({ name: '', email: '', message: '', attachmentUrl: '' });
          setFileName('');
        }
      } catch (error) {
        alert("Failed to send message. Please try again.");
      } finally { setIsSubmitting(false); }
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

      {/* HEADER SECTION - Responsive */}
      <section className="pt-24 md:pt-32 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center mb-10 md:mb-16 relative">
        <div className="absolute top-10 left-1/4 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-purple-400/10 rounded-full blur-[80px] pointer-events-none"></div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter mb-4 md:mb-6 relative z-10">
          Let's Start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Conversation<span onClick={handleSecretClick} className="cursor-default text-transparent select-none">.</span></span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl font-medium relative z-10">
          Have a project in mind, need a custom web application, or just want to say hi? Drop a message below.
        </p>
      </section>

      {/* CONTACT LAYOUT - Responsive Padding & Flex Column */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-[2rem] lg:rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Side: Contact Info */}
          <div className="lg:w-2/5 bg-slate-900 text-white p-8 md:p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden group">
            
            {/* ADMIN CONTROLS (EYE + EDIT) */}
            {isEditing && (
              <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex gap-2 md:gap-3">
                <button 
                  onClick={handleOpenInbox} 
                  title="View Inbox"
                  className="bg-emerald-500/20 hover:bg-emerald-500 p-2.5 md:p-3 rounded-full text-emerald-400 hover:text-white transition-all shadow-sm flex items-center justify-center"
                >
                  <Eye size={18} className="md:w-5 md:h-5" />
                </button>
                <button 
                  onClick={openEditInfoModal} 
                  title="Edit Info"
                  className="bg-white/10 hover:bg-white/20 p-2.5 md:p-3 rounded-full text-white transition-all shadow-sm"
                >
                  <Edit3 size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
            )}

            <div className="absolute -right-20 -bottom-20 w-48 h-48 md:w-64 md:h-64 bg-blue-600/40 blur-[60px] md:blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 tracking-tight">Contact Information</h3>
              <p className="text-slate-400 mb-8 md:mb-12 text-base md:text-lg">
                Fill up the form and I will get back to you within 24 hours.
              </p>
              
              <div className="space-y-6 md:space-y-8">
                <div className="flex items-start gap-3 md:gap-4">
                  <Mail className="text-blue-400 mt-1 md:w-6 md:h-6" size={20} />
                  <div>
                    <span className="block text-xs md:text-sm text-slate-400 font-semibold mb-1">Email Me</span>
                    <a href={`mailto:${displayInfo.email}`} className="font-medium text-base md:text-lg hover:text-blue-400 transition-colors">
                      {displayInfo.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 md:gap-4">
                  <MapPin className="text-blue-400 mt-1 md:w-6 md:h-6" size={20} />
                  <div>
                    <span className="block text-xs md:text-sm text-slate-400 font-semibold mb-1">Location</span>
                    <span className="font-medium text-base md:text-lg block">{displayInfo.location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 md:gap-4">
                  <Phone className="text-blue-400 mt-1 md:w-6 md:h-6" size={20} />
                  <div>
                    <span className="block text-xs md:text-sm text-slate-400 font-semibold mb-1">Status</span>
                    <span className="font-medium text-base md:text-lg block text-emerald-400">{displayInfo.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="lg:w-3/5 p-6 md:p-10 lg:p-16">
            <form onSubmit={handleFormSubmit} className="space-y-5 md:space-y-6">
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1.5 md:mb-2">Your Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="John Doe" className={`w-full bg-slate-50 border ${errors.name ? 'border-red-400 focus:ring-red-500/10' : 'border-slate-200 focus:ring-blue-500/10'} rounded-xl px-4 py-3 md:px-5 md:py-4 text-sm md:text-base text-slate-900 outline-none transition-all focus:ring-4 focus:border-blue-500`} />
                {errors.name && <p className="text-red-500 text-xs md:text-sm mt-1.5 md:mt-2 font-medium">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1.5 md:mb-2">Your Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="john@example.com" className={`w-full bg-slate-50 border ${errors.email ? 'border-red-400 focus:ring-red-500/10' : 'border-slate-200 focus:ring-blue-500/10'} rounded-xl px-4 py-3 md:px-5 md:py-4 text-sm md:text-base text-slate-900 outline-none transition-all focus:ring-4 focus:border-blue-500`} />
                {errors.email && <p className="text-red-500 text-xs md:text-sm mt-1.5 md:mt-2 font-medium">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1.5 md:mb-2">Message</label>
                <textarea name="message" value={formData.message} onChange={handleFormChange} placeholder="Tell me about your project..." rows="4" className={`w-full bg-slate-50 border ${errors.message ? 'border-red-400 focus:ring-red-500/10' : 'border-slate-200 focus:ring-blue-500/10'} rounded-xl px-4 py-3 md:px-5 md:py-4 text-sm md:text-base text-slate-900 outline-none transition-all focus:ring-4 focus:border-blue-500 resize-none`}></textarea>
                {errors.message && <p className="text-red-500 text-xs md:text-sm mt-1.5 md:mt-2 font-medium">{errors.message}</p>}
              </div>

              {/* Dynamic File Upload */}
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1.5 md:mb-2">Attachment (Optional)</label>
                <div className="relative">
                  <input type="file" id="file-upload" onChange={handleFileUpload} className="hidden" />
                  <label htmlFor="file-upload" className="flex items-center gap-3 w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 md:px-5 md:py-4 text-sm md:text-base text-slate-500 cursor-pointer transition-colors">
                    {uploadingFile ? <Loader2 size={18} className="animate-spin text-blue-500 md:w-5 md:h-5" /> : <Paperclip size={18} className={`md:w-5 md:h-5 ${formData.attachmentUrl ? "text-emerald-500" : "text-slate-400"}`} />}
                    <span className="font-medium truncate">
                      {uploadingFile ? "Uploading..." : fileName ? fileName : "Attach a document"}
                    </span>
                  </label>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || uploadingFile} className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base md:text-lg py-3.5 md:py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 ${(isSubmitting || uploadingFile) ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {isSubmitting ? 'Sending...' : 'Send Message'} <Send size={18} className="md:w-5 md:h-5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --- INBOX (MESSAGES) MODAL - Responsive Table --- */}
      {showInboxModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-10 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in zoom-in duration-300">
            
            <button onClick={() => setShowInboxModal(false)} className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors z-10">
              <X size={18} className="md:w-5 md:h-5" />
            </button>
            
            <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
              <Mail className="text-blue-600 w-5 h-5 md:w-8 md:h-8" /> Message Inbox
            </h2>

            <div className="overflow-y-auto pr-1 md:pr-2 hide-scrollbar flex-grow">
              {loadingInbox ? (
                <div className="flex justify-center py-10 md:py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
              ) : inboxMessages.length === 0 ? (
                <div className="text-center py-10 md:py-20 text-slate-500 font-medium text-sm md:text-base">No messages yet.</div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-[1rem] md:rounded-2xl">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 text-slate-900 border-b border-slate-200">
                        <th className="p-3 md:p-4 font-bold text-xs md:text-sm">Date</th>
                        <th className="p-3 md:p-4 font-bold text-xs md:text-sm">Name</th>
                        <th className="p-3 md:p-4 font-bold text-xs md:text-sm">Email</th>
                        <th className="p-3 md:p-4 font-bold text-xs md:text-sm w-1/2">Message</th>
                        <th className="p-3 md:p-4 font-bold text-xs md:text-sm text-center">File</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inboxMessages.map((msg) => (
                        <tr key={msg._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 md:p-4 text-xs md:text-sm text-slate-500 font-medium">
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <Calendar size={12} className="md:w-3.5 md:h-3.5" /> 
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-3 md:p-4 text-xs md:text-sm text-slate-900 font-semibold">{msg.name}</td>
                          <td className="p-3 md:p-4 text-xs md:text-sm text-blue-600"><a href={`mailto:${msg.email}`}>{msg.email}</a></td>
                          <td className="p-3 md:p-4 text-xs md:text-sm text-slate-600 truncate max-w-[150px] md:max-w-xs overflow-hidden" title={msg.message}>
                            {msg.message}
                          </td>
                          <td className="p-3 md:p-4 text-xs md:text-sm text-slate-500 text-center">
                            {msg.attachmentUrl ? (
                              <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-1.5 md:p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100">
                                <Download size={14} className="md:w-4 md:h-4" />
                              </a>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SUCCESS MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-6 md:p-12 max-w-sm w-full text-center shadow-2xl relative animate-in fade-in zoom-in">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-50 p-2 rounded-full"><X size={18} className="md:w-5 md:h-5" /></button>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 md:mb-6"><CheckCircle2 size={32} className="text-emerald-500 md:w-10 md:h-10" /></div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 md:mb-3 tracking-tight">Message Sent!</h3>
            <p className="text-sm md:text-base text-slate-500 font-medium mb-6 md:mb-8">Thanks for reaching out. I've received your message and will get back to you shortly.</p>
            <button onClick={() => setIsModalOpen(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 md:py-3.5 rounded-xl text-sm md:text-base">Got it</button>
          </div>
        </div>
      )}

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

      {/* --- EDIT INFO MODAL (Admin) --- */}
      {showEditInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in">
            <button onClick={() => setShowEditInfoModal(false)} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={18} className="md:w-5 md:h-5" /></button>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-5">Edit Contact Details</h2>
            <form onSubmit={handleSaveInfo} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1">Email Address</label>
                <input type="email" value={editInfoData.email} onChange={(e) => setEditInfoData({...editInfoData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none focus:border-blue-500 text-xs md:text-sm" required />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1">Location</label>
                <input type="text" value={editInfoData.location} onChange={(e) => setEditInfoData({...editInfoData, location: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none focus:border-blue-500 text-xs md:text-sm" required />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-900 mb-1">Freelance Status</label>
                <input type="text" value={editInfoData.status} onChange={(e) => setEditInfoData({...editInfoData, status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none focus:border-blue-500 text-xs md:text-sm" required />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 md:py-3 rounded-xl shadow-lg text-sm md:text-base">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Contact;