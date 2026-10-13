import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Edit3, Trash2, X, Loader2, Search,
  Mail, Phone, Building2, MapPin, FileText, User,
  CheckCircle2, AlertCircle, Lock
} from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE from '../data/api';

const STATUS_COLORS = {
  active:   { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  inactive: { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400' },
  lead:     { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' }
};

const EMPTY_FORM = { name: '', email: '', phone: '', company: '', address: '', notes: '', status: 'active' };

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Auth guard
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // CRUD modal
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Verify admin token on load
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('admin_jwt_token');
      if (!token) {
        setAuthChecked(true);
        setShowAuthModal(true);
        return;
      }
      try {
        await axios.get(`${API_BASE}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsAdmin(true);
        fetchClients();
      } catch {
        localStorage.removeItem('admin_jwt_token');
        setShowAuthModal(true);
      } finally {
        setAuthChecked(true);
      }
    };
    verifyToken();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_jwt_token');
      const res = await axios.get(`${API_BASE}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setClients(res.data.data);
    } catch (err) {
      console.error('Failed to fetch clients', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { passcode });
      if (res.data.success) {
        localStorage.setItem('admin_jwt_token', res.data.token);
        setIsAdmin(true);
        setShowAuthModal(false);
        setPasscode('');
        fetchClients();
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Access Denied.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingClient(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({ 
      name: client.name, email: client.email, phone: client.phone,
      company: client.company, address: client.address, notes: client.notes,
      status: client.status
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    setIsSaving(true);
    setFormError('');
    try {
      const token = localStorage.getItem('admin_jwt_token');
      const headers = { Authorization: `Bearer ${token}` };
      let res;
      if (editingClient) {
        res = await axios.put(`${API_BASE}/api/clients/${editingClient._id}`, formData, { headers });
        setClients(prev => prev.map(c => c._id === editingClient._id ? res.data.data : c));
      } else {
        res = await axios.post(`${API_BASE}/api/clients`, formData, { headers });
        setClients(prev => [res.data.data, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save client.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('admin_jwt_token');
      await axios.delete(`${API_BASE}/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(prev => prev.filter(c => c._id !== id));
      setShowDeleteConfirm(null);
    } catch {
      alert('Failed to delete client.');
    }
  };

  const filtered = clients.filter(c => {
    const matchSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    lead: clients.filter(c => c.status === 'lead').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
  };

  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fafcff]"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  return (
    <div className="bg-[#fafcff] min-h-screen font-sans pb-20">
      
      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 mx-auto"><Lock size={28} className="text-white" /></div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1 text-center">Admin Access Required</h3>
            <p className="text-slate-500 text-sm text-center mb-6">Enter your secret passcode to manage clients.</p>
            <form onSubmit={handleLogin}>
              <input type="password" value={passcode} onChange={e => setPasscode(e.target.value)}
                placeholder="Secret passcode" autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-center font-bold tracking-widest outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 mb-3" />
              {authError && <p className="text-red-500 text-sm text-center font-bold mb-3">{authError}</p>}
              <button type="submit" disabled={isAuthLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all">
                {isAuthLoading ? 'Verifying...' : 'Authenticate'}
              </button>
            </form>
            <Link to="/" className="block text-center text-slate-400 text-sm mt-4 hover:text-slate-600">← Back to Portfolio</Link>
          </div>
        </div>
      )}

      {isAdmin && (
        <>
          {/* PAGE HEADER */}
          <section className="pt-28 pb-10 px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">Client List</h1>
                <p className="text-slate-500 text-lg font-medium">Manage your clients and business relationships.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/invoices"
                  className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm">
                  <FileText size={16} /> Invoices
                </Link>
                <button onClick={openAddModal}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/30">
                  <Plus size={16} /> Add Client
                </button>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Clients', value: stats.total, color: 'text-slate-900', bg: 'bg-white' },
                { label: 'Active', value: stats.active, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Leads', value: stats.lead, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Inactive', value: stats.inactive, color: 'text-slate-400', bg: 'bg-slate-50' },
              ].map(stat => (
                <div key={stat.label} className={`${stat.bg} border border-slate-100 rounded-2xl p-5 shadow-sm`}>
                  <p className={`text-3xl font-black ${stat.color} mb-1`}>{stat.value}</p>
                  <p className="text-slate-500 text-sm font-semibold">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FILTERS */}
          <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search clients by name, email, company…"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 cursor-pointer">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="lead">Leads</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </section>

          {/* CLIENT GRID */}
          <section className="px-6 lg:px-8 max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-600" size={36} /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <Users size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-semibold text-lg">
                  {clients.length === 0 ? 'No clients yet. Add your first client!' : 'No clients match your search.'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(client => {
                  const sc = STATUS_COLORS[client.status] || STATUS_COLORS.active;
                  return (
                    <div key={client._id}
                      className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
                      
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-base leading-tight">{client.name}</h3>
                            {client.company && <p className="text-xs text-slate-500 font-medium">{client.company}</p>}
                          </div>
                        </div>
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-5">
                        <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                          <Mail size={13} className="text-slate-400 flex-shrink-0" /> <span className="truncate">{client.email}</span>
                        </a>
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone size={13} className="text-slate-400 flex-shrink-0" /> {client.phone}
                          </div>
                        )}
                        {client.address && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <MapPin size={13} className="text-slate-400 flex-shrink-0" /> <span className="truncate">{client.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-slate-100">
                        <Link to={`/invoices?clientId=${client._id}&clientName=${encodeURIComponent(client.name)}&clientEmail=${encodeURIComponent(client.email)}&clientPhone=${encodeURIComponent(client.phone || '')}&clientCompany=${encodeURIComponent(client.company || '')}`}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2.5 rounded-xl transition-all">
                          <FileText size={13} /> Invoice
                        </Link>
                        <button onClick={() => openEditModal(client)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all">
                          <Edit3 size={13} /> Edit
                        </button>
                        <button onClick={() => setShowDeleteConfirm(client._id)}
                          className="flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* ADD / EDIT CLIENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={18} /></button>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-5">
              <User size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Company</label>
                  <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" placeholder="Acme Corp" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" placeholder="Raipur, CG, India" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 cursor-pointer">
                  <option value="active">Active</option>
                  <option value="lead">Lead</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes</label>
                <textarea rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 resize-none" placeholder="Any notes about this client…" />
              </div>
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle size={15} className="text-red-500" />
                  <p className="text-red-600 text-sm font-medium">{formError}</p>
                </div>
              )}
              <button type="submit" disabled={isSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {isSaving ? 'Saving…' : editingClient ? 'Save Changes' : 'Add Client'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-[1.5rem] p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Client?</h3>
            <p className="text-slate-500 text-sm mb-6">This action cannot be undone. All client data will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
