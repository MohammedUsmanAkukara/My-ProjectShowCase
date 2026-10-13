import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Trash2, X, Loader2, Send, Eye,
  CheckCircle2, AlertCircle, Lock, IndianRupee, Download,
  Users, Edit3, Mail, Calendar, ChevronDown, Search
} from 'lucide-react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import API_BASE from '../data/api';

/* ─── helpers ─────────────────────────────── */
const fmt = (n, cur = 'INR') => {
  const sym = cur === 'INR' ? '₹' : '$';
  return `${sym}${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

const STATUS_CFG = {
  draft:     { bg: 'bg-slate-100',    text: 'text-slate-600',   dot: 'bg-slate-400'   },
  sent:      { bg: 'bg-blue-50',      text: 'text-blue-700',    dot: 'bg-blue-500'    },
  paid:      { bg: 'bg-emerald-50',   text: 'text-emerald-700', dot: 'bg-emerald-500' },
  partial:   { bg: 'bg-amber-50',     text: 'text-amber-700',   dot: 'bg-amber-500'   },
  overdue:   { bg: 'bg-red-50',       text: 'text-red-700',     dot: 'bg-red-500'     },
  cancelled: { bg: 'bg-slate-100',    text: 'text-slate-400',   dot: 'bg-slate-300'   }
};

const EMPTY_ITEM = { description: '', quantity: 1, rate: 0, amount: 0 };

const getEmptyForm = (prefill = {}) => ({
  type: 'invoice',
  clientId: '', clientName: '', clientEmail: '', clientPhone: '', clientCompany: '', clientAddress: '',
  items: [{ ...EMPTY_ITEM }],
  taxRate: 0, advanceAmount: 0,
  currency: 'INR', status: 'draft',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  notes: '', terms: 'Payment due within 7 days of invoice date.',
  ...prefill
});

/* ─── Component ────────────────────────────── */
const Invoices = () => {
  const location = useLocation();

  // Auth
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Data
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Email send state
  const [sendingId, setSendingId] = useState(null);
  const [sendSuccess, setSendSuccess] = useState('');

  // Preview invoice
  const [previewInvoice, setPreviewInvoice] = useState(null);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(null);

  /* ── prefill from client page query params ── */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const clientId = params.get('clientId');
    if (clientId) {
      setFormData(getEmptyForm({
        clientId,
        clientName: decodeURIComponent(params.get('clientName') || ''),
        clientEmail: decodeURIComponent(params.get('clientEmail') || ''),
        clientPhone: decodeURIComponent(params.get('clientPhone') || ''),
        clientCompany: decodeURIComponent(params.get('clientCompany') || '')
      }));
      setShowForm(true);
    }
  }, [location.search]);

  /* ── verify token ── */
  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('admin_jwt_token');
      if (!token) { setAuthChecked(true); setShowAuthModal(true); return; }
      try {
        await axios.get(`${API_BASE}/api/auth/verify`, { headers: { Authorization: `Bearer ${token}` } });
        setIsAdmin(true);
        fetchData();
      } catch {
        localStorage.removeItem('admin_jwt_token');
        setShowAuthModal(true);
      } finally { setAuthChecked(true); }
    };
    verify();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_jwt_token');
      const headers = { Authorization: `Bearer ${token}` };
      const [invRes, cliRes] = await Promise.all([
        axios.get(`${API_BASE}/api/invoices`, { headers }),
        axios.get(`${API_BASE}/api/clients`, { headers })
      ]);
      if (invRes.data.success) setInvoices(invRes.data.data);
      if (cliRes.data.success) setClients(cliRes.data.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  /* ── auth login ── */
  const handleLogin = async (e) => {
    e.preventDefault(); setIsAuthLoading(true); setAuthError('');
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { passcode });
      if (res.data.success) {
        localStorage.setItem('admin_jwt_token', res.data.token);
        setIsAdmin(true); setShowAuthModal(false); setPasscode(''); fetchData();
      }
    } catch (err) { setAuthError(err.response?.data?.message || 'Access Denied.'); }
    finally { setIsAuthLoading(false); }
  };

  /* ── computed totals ── */
  const computedTotals = useCallback(() => {
    const subtotal = formData.items.reduce((s, it) => s + (Number(it.quantity) * Number(it.rate)), 0);
    const taxAmount = (subtotal * (Number(formData.taxRate) || 0)) / 100;
    const total = subtotal + taxAmount;
    const advance = Number(formData.advanceAmount) || 0;
    const balance = total - advance;
    return { subtotal, taxAmount, total, balance };
  }, [formData]);

  /* ── form helpers ── */
  const handleItemChange = (idx, field, val) => {
    const items = [...formData.items];
    items[idx] = { ...items[idx], [field]: val, amount: field === 'quantity' || field === 'rate'
      ? (field === 'quantity' ? Number(val) : items[idx].quantity) * (field === 'rate' ? Number(val) : items[idx].rate)
      : items[idx].amount };
    setFormData(p => ({ ...p, items }));
  };

  const addItem = () => setFormData(p => ({ ...p, items: [...p.items, { ...EMPTY_ITEM }] }));
  const removeItem = (idx) => setFormData(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  const fillFromClient = (clientId) => {
    const c = clients.find(x => x._id === clientId);
    if (!c) return;
    setFormData(p => ({ ...p, clientId: c._id, clientName: c.name, clientEmail: c.email,
      clientPhone: c.phone || '', clientCompany: c.company || '', clientAddress: c.address || '' }));
  };

  /* ── open new form ── */
  const openNewForm = () => {
    setEditingInvoice(null); setFormData(getEmptyForm()); setFormError(''); setShowForm(true);
  };

  const openEditForm = (inv) => {
    setEditingInvoice(inv);
    setFormData({
      type: inv.type, clientId: inv.clientId || '', clientName: inv.clientName,
      clientEmail: inv.clientEmail, clientPhone: inv.clientPhone || '',
      clientCompany: inv.clientCompany || '', clientAddress: inv.clientAddress || '',
      items: inv.items.map(it => ({ ...it })),
      taxRate: inv.taxRate || 0, advanceAmount: inv.advanceAmount || 0,
      currency: inv.currency || 'INR', status: inv.status,
      issueDate: inv.issueDate ? inv.issueDate.split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: inv.dueDate ? inv.dueDate.split('T')[0] : '',
      notes: inv.notes || '', terms: inv.terms || ''
    });
    setFormError(''); setShowForm(true);
  };

  /* ── save ── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientEmail) { setFormError('Client name and email are required.'); return; }
    if (formData.items.length === 0) { setFormError('Add at least one line item.'); return; }
    setIsSaving(true); setFormError('');
    try {
      const token = localStorage.getItem('admin_jwt_token');
      const headers = { Authorization: `Bearer ${token}` };
      let res;
      if (editingInvoice) {
        res = await axios.put(`${API_BASE}/api/invoices/${editingInvoice._id}`, formData, { headers });
        setInvoices(prev => prev.map(i => i._id === editingInvoice._id ? res.data.data : i));
      } else {
        res = await axios.post(`${API_BASE}/api/invoices`, formData, { headers });
        setInvoices(prev => [res.data.data, ...prev]);
      }
      setShowForm(false);
    } catch (err) { setFormError(err.response?.data?.message || 'Failed to save.'); }
    finally { setIsSaving(false); }
  };

  /* ── delete ── */
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('admin_jwt_token');
      await axios.delete(`${API_BASE}/api/invoices/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setInvoices(prev => prev.filter(i => i._id !== id));
      setShowDeleteConfirm(null);
    } catch { alert('Failed to delete.'); }
  };

  /* ── send email ── */
  const handleSend = async (id) => {
    setSendingId(id); setSendSuccess('');
    try {
      const token = localStorage.getItem('admin_jwt_token');
      const res = await axios.post(`${API_BASE}/api/invoices/${id}/send`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSendSuccess(res.data.message);
      // Update status in list
      setInvoices(prev => prev.map(i => i._id === id ? { ...i, status: i.status === 'draft' ? 'sent' : i.status } : i));
      setTimeout(() => setSendSuccess(''), 4000);
    } catch (err) { alert(err.response?.data?.message || 'Failed to send email.'); }
    finally { setSendingId(null); }
  };

  /* ── update status ── */
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingStatus(id);
    try {
      const token = localStorage.getItem('admin_jwt_token');
      const res = await axios.put(`${API_BASE}/api/invoices/${id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setInvoices(prev => prev.map(i => i._id === id ? res.data.data : i));
    } catch { alert('Failed to update status.'); }
    finally { setUpdatingStatus(null); }
  };

  /* ── filtered list ── */
  const filtered = invoices.filter(inv => {
    const matchType   = typeFilter === 'all' || inv.type === typeFilter;
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchSearch = !search || [inv.clientName, inv.clientEmail, inv.invoiceNumber, inv.clientCompany]
      .some(v => v && v.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchStatus && matchSearch;
  });

  const totals = { subtotal: 0, taxAmount: 0, total: 0, balance: 0 };
  if (showForm) {
    const t = computedTotals();
    Object.assign(totals, t);
  }

  const stats = {
    total:   invoices.length,
    draft:   invoices.filter(i => i.status === 'draft').length,
    sent:    invoices.filter(i => i.status === 'sent').length,
    paid:    invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    revenue: invoices.filter(i => ['paid','partial'].includes(i.status)).reduce((s, i) => s + i.totalAmount, 0),
  };

  if (!authChecked) return <div className="min-h-screen flex items-center justify-center bg-[#fafcff]"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="bg-[#fafcff] min-h-screen font-sans pb-20">

      {/* ── AUTH MODAL ── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 mx-auto"><Lock size={28} className="text-white" /></div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1 text-center">Admin Access Required</h3>
            <p className="text-slate-500 text-sm text-center mb-6">Enter your passcode to manage invoices.</p>
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
          {/* ── SEND SUCCESS TOAST ── */}
          {sendSuccess && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-semibold text-sm animate-bounce-once">
              <CheckCircle2 size={18} /> {sendSuccess}
            </div>
          )}

          {/* ── PAGE HEADER ── */}
          <section className="pt-28 pb-10 px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">Invoices & Quotations</h1>
                <p className="text-slate-500 text-lg font-medium">Create, send and track your financial documents.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/clients" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm">
                  <Users size={16} /> Clients
                </Link>
                <button onClick={openNewForm}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/30">
                  <Plus size={16} /> New Invoice
                </button>
              </div>
            </div>
          </section>

          {/* ── STATS ── */}
          <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total', value: stats.total, color: 'text-slate-900', bg: 'bg-white' },
                { label: 'Draft', value: stats.draft, color: 'text-slate-500', bg: 'bg-slate-50' },
                { label: 'Sent', value: stats.sent, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Paid', value: stats.paid, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Overdue', value: stats.overdue, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Revenue', value: fmt(stats.revenue), color: 'text-indigo-600', bg: 'bg-indigo-50' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} border border-slate-100 rounded-2xl p-4 shadow-sm`}>
                  <p className={`text-2xl font-black ${s.color} mb-0.5`}>{s.value}</p>
                  <p className="text-slate-500 text-xs font-bold">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── FILTERS ── */}
          <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-6">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-grow min-w-[200px]">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client, invoice #…"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400" />
              </div>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 cursor-pointer">
                <option value="all">All Types</option>
                <option value="invoice">Invoice</option>
                <option value="quotation">Quotation</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 cursor-pointer">
                <option value="all">All Status</option>
                {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </section>

          {/* ── INVOICE TABLE ── */}
          <section className="px-6 lg:px-8 max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-600" size={36} /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <FileText size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-semibold text-lg">
                  {invoices.length === 0 ? 'No invoices yet. Create your first one!' : 'No invoices match your filters.'}
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice #</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Client</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Advance</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Balance</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.map(inv => {
                        const sc = STATUS_CFG[inv.status] || STATUS_CFG.draft;
                        const isQuotation = inv.type === 'quotation';
                        return (
                          <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${isQuotation ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                  {isQuotation ? 'QT' : 'INV'}
                                </span>
                                <span className="font-mono text-sm font-semibold text-slate-700">{inv.invoiceNumber}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-900 text-sm">{inv.clientName}</div>
                              {inv.clientCompany && <div className="text-xs text-slate-400">{inv.clientCompany}</div>}
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-500">
                              {new Date(inv.issueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                            </td>
                            <td className="px-5 py-4 text-sm font-bold text-slate-900 text-right">{fmt(inv.totalAmount, inv.currency)}</td>
                            <td className="px-5 py-4 text-sm font-semibold text-emerald-600 text-right">
                              {inv.advanceAmount > 0 ? fmt(inv.advanceAmount, inv.currency) : '—'}
                            </td>
                            <td className="px-5 py-4 text-sm font-bold text-red-500 text-right">
                              {inv.balanceAmount > 0 ? fmt(inv.balanceAmount, inv.currency) : <span className="text-emerald-600">Cleared</span>}
                            </td>
                            <td className="px-5 py-4">
                              <div className="relative group inline-block">
                                <select
                                  value={inv.status}
                                  onChange={e => handleStatusChange(inv._id, e.target.value)}
                                  disabled={updatingStatus === inv._id}
                                  className={`appearance-none pr-7 pl-2.5 py-1.5 rounded-full text-xs font-bold cursor-pointer outline-none ${sc.bg} ${sc.text} border-0 transition-all`}
                                >
                                  {Object.keys(STATUS_CFG).map(s => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                  ))}
                                </select>
                                <ChevronDown size={10} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${sc.text}`} />
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setPreviewInvoice(inv)} title="Preview"
                                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all">
                                  <Eye size={14} />
                                </button>
                                <button onClick={() => openEditForm(inv)} title="Edit"
                                  className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all">
                                  <Edit3 size={14} />
                                </button>
                                <button onClick={() => handleSend(inv._id)} title="Send Email" disabled={sendingId === inv._id}
                                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all disabled:opacity-50">
                                  {sendingId === inv._id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                </button>
                                <button onClick={() => setShowDeleteConfirm(inv._id)} title="Delete"
                                  className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* ═══ CREATE / EDIT INVOICE FORM MODAL ═══ */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Form Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between z-10 rounded-t-[2rem]">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{editingInvoice ? 'Edit Document' : 'New Invoice / Quotation'}</h2>
                <p className="text-slate-400 text-sm">{editingInvoice ? editingInvoice.invoiceNumber : 'Fill in the details below'}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-8">

              {/* Type & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Document Type</label>
                  <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 cursor-pointer">
                    <option value="invoice">Invoice</option>
                    <option value="quotation">Quotation / Estimate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Currency</label>
                  <select value={formData.currency} onChange={e => setFormData(p => ({ ...p, currency: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 cursor-pointer">
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {/* Client Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Client Details</h3>
                  {clients.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Quick fill:</span>
                      <select onChange={e => fillFromClient(e.target.value)} defaultValue=""
                        className="bg-blue-50 border border-blue-100 text-blue-700 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-blue-400 cursor-pointer">
                        <option value="" disabled>Select client…</option>
                        {clients.map(c => <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 rounded-2xl p-5 space-y-3 border border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
                      <input type="text" required value={formData.clientName} onChange={e => setFormData(p => ({ ...p, clientName: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Email *</label>
                      <input type="email" required value={formData.clientEmail} onChange={e => setFormData(p => ({ ...p, clientEmail: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Phone</label>
                      <input type="tel" value={formData.clientPhone} onChange={e => setFormData(p => ({ ...p, clientPhone: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500" placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Company</label>
                      <input type="text" value={formData.clientCompany} onChange={e => setFormData(p => ({ ...p, clientCompany: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500" placeholder="Acme Corp" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Address</label>
                    <input type="text" value={formData.clientAddress} onChange={e => setFormData(p => ({ ...p, clientAddress: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500" placeholder="City, State, Country" />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Issue Date</label>
                  <input type="date" value={formData.issueDate} onChange={e => setFormData(p => ({ ...p, issueDate: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Line Items</h3>
                  <button type="button" onClick={addItem}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all">
                    <Plus size={13} /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="hidden sm:grid grid-cols-12 gap-3 px-3">
                    <span className="col-span-6 text-xs font-bold text-slate-400">DESCRIPTION</span>
                    <span className="col-span-2 text-xs font-bold text-slate-400 text-center">QTY</span>
                    <span className="col-span-2 text-xs font-bold text-slate-400 text-right">RATE</span>
                    <span className="col-span-2 text-xs font-bold text-slate-400 text-right">AMOUNT</span>
                  </div>
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-3 grid grid-cols-12 gap-3 items-center border border-slate-100">
                      <input className="col-span-12 sm:col-span-6 bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                        placeholder="e.g. Website Development" value={item.description}
                        onChange={e => handleItemChange(idx, 'description', e.target.value)} />
                      <input className="col-span-4 sm:col-span-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-center outline-none focus:border-blue-400"
                        type="number" min="1" value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)} />
                      <input className="col-span-4 sm:col-span-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-right outline-none focus:border-blue-400"
                        type="number" min="0" step="0.01" value={item.rate}
                        onChange={e => handleItemChange(idx, 'rate', e.target.value)} />
                      <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
                        <span className="text-sm font-bold text-slate-700">{fmt(item.quantity * item.rate, formData.currency)}</span>
                        {formData.items.length > 1 && (
                          <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 transition-colors p-0.5">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing summary */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">GST / Tax Rate (%)</label>
                    <input type="number" min="0" max="100" step="0.01" value={formData.taxRate}
                      onChange={e => setFormData(p => ({ ...p, taxRate: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span>
                      Advance Received ({formData.currency === 'INR' ? '₹' : '$'})
                    </label>
                    <input type="number" min="0" step="0.01" value={formData.advanceAmount}
                      onChange={e => setFormData(p => ({ ...p, advanceAmount: e.target.value }))}
                      className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" placeholder="0.00" />
                    <p className="text-xs text-emerald-600 font-medium mt-1">Enter advance amount already paid by client</p>
                  </div>
                </div>

                {/* Totals breakdown */}
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="font-semibold text-slate-700">{fmt(totals.subtotal, formData.currency)}</span>
                  </div>
                  {Number(formData.taxRate) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Tax ({formData.taxRate}%)</span>
                      <span className="font-semibold text-slate-700">{fmt(totals.taxAmount, formData.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black pt-1 border-t border-slate-200">
                    <span className="text-slate-900">Total</span>
                    <span className="text-blue-600">{fmt(totals.total, formData.currency)}</span>
                  </div>
                  {Number(formData.advanceAmount) > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-600 font-semibold">Advance Paid</span>
                        <span className="text-emerald-600 font-semibold">- {fmt(formData.advanceAmount, formData.currency)}</span>
                      </div>
                      <div className="flex justify-between text-base font-black border-t border-red-100 pt-1">
                        <span className="text-red-600">Balance Due</span>
                        <span className="text-red-600">{fmt(totals.balance, formData.currency)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Notes & Terms */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes (visible to client)</label>
                  <textarea rows="2" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 resize-none"
                    placeholder="e.g. Thank you for your business!" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Terms & Conditions</label>
                  <textarea rows="2" value={formData.terms} onChange={e => setFormData(p => ({ ...p, terms: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 resize-none" />
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle size={15} className="text-red-500" /><p className="text-red-600 text-sm font-medium">{formError}</p>
                </div>
              )}

              {/* Sticky Footer Buttons */}
              <div className="sticky bottom-0 bg-white border-t border-slate-100 -mx-8 -mb-8 px-8 py-5 flex gap-3 rounded-b-[2rem]">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all text-sm">Cancel</button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-sm disabled:opacity-70">
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {isSaving ? 'Saving…' : editingInvoice ? 'Update Document' : 'Create Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ PREVIEW MODAL ═══ */}
      {previewInvoice && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-[2rem]">
              <div>
                <h2 className="font-black text-slate-900 text-lg">{previewInvoice.invoiceNumber}</h2>
                <p className="text-slate-400 text-xs">{previewInvoice.type === 'quotation' ? 'Quotation' : 'Invoice'} Preview</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleSend(previewInvoice._id)} disabled={sendingId === previewInvoice._id}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-70">
                  {sendingId === previewInvoice._id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Send to {previewInvoice.clientEmail}
                </button>
                <button onClick={() => setPreviewInvoice(null)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={18} /></button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Preview Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</p>
                  <p className="font-bold text-slate-900">{previewInvoice.clientName}</p>
                  {previewInvoice.clientCompany && <p className="text-sm text-slate-500">{previewInvoice.clientCompany}</p>}
                  <p className="text-sm text-blue-600">{previewInvoice.clientEmail}</p>
                  {previewInvoice.clientPhone && <p className="text-sm text-slate-500">{previewInvoice.clientPhone}</p>}
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Details</p>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="text-slate-400">Issued: </span><span className="font-semibold">{new Date(previewInvoice.issueDate).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'})}</span></p>
                    {previewInvoice.dueDate && <p className="text-sm"><span className="text-slate-400">Due: </span><span className="font-semibold text-red-500">{new Date(previewInvoice.dueDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span></p>}
                  </div>
                </div>
              </div>
              {/* Items */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3 text-left text-xs font-bold text-slate-400">Item</th>
                      <th className="p-3 text-center text-xs font-bold text-slate-400">Qty</th>
                      <th className="p-3 text-right text-xs font-bold text-slate-400">Rate</th>
                      <th className="p-3 text-right text-xs font-bold text-slate-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {previewInvoice.items.map((it, i) => (
                      <tr key={i}>
                        <td className="p-3 text-slate-800">{it.description}</td>
                        <td className="p-3 text-center text-slate-500">{it.quantity}</td>
                        <td className="p-3 text-right text-slate-500">{fmt(it.rate, previewInvoice.currency)}</td>
                        <td className="p-3 text-right font-semibold text-slate-800">{fmt(it.amount, previewInvoice.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Totals */}
              <div className="flex justify-end">
                <div className="bg-slate-50 rounded-xl p-4 min-w-[240px] space-y-2">
                  {previewInvoice.taxRate > 0 && (
                    <>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span>{fmt(previewInvoice.subtotal, previewInvoice.currency)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Tax ({previewInvoice.taxRate}%)</span><span>{fmt(previewInvoice.taxAmount, previewInvoice.currency)}</span></div>
                    </>
                  )}
                  <div className="flex justify-between font-black pt-1 border-t border-slate-200">
                    <span className="text-slate-900">Total</span>
                    <span className="text-blue-600">{fmt(previewInvoice.totalAmount, previewInvoice.currency)}</span>
                  </div>
                  {previewInvoice.advanceAmount > 0 && (
                    <>
                      <div className="flex justify-between text-sm"><span className="text-emerald-600 font-semibold">Advance</span><span className="text-emerald-600">- {fmt(previewInvoice.advanceAmount, previewInvoice.currency)}</span></div>
                      <div className="flex justify-between font-black border-t border-red-100 pt-1"><span className="text-red-500">Balance</span><span className="text-red-500">{fmt(previewInvoice.balanceAmount, previewInvoice.currency)}</span></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-[1.5rem] p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5"><Trash2 size={24} className="text-red-500" /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete this document?</h3>
            <p className="text-slate-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
