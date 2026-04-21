import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api';
import { useAuth } from '../context/useAuth';
import DOMPurify from 'dompurify';
import { getAllPostsAdmin, deletePost, savePost } from '../utils/blogStorage';
import { PlusCircle, Pencil, Trash2, Eye, EyeOff, KeyRound } from 'lucide-react';

const statuses = ['NEW', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'];
const C = {
  bg: '#DCF4F1',
  primary: '#062926',
  accent: '#2AB5A5',
  muted: '#4A7C78',
  border: 'rgba(6,41,38,0.14)',
  surface: 'rgba(255,255,255,0.86)',
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('waitlist');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [oPage, setOPage] = useState(1);
  const [oStatus, setOStatus] = useState('');
  const [oPagination, setOPagination] = useState({ totalPages: 1, total: 0 });
  const [oLoading, setOLoading] = useState(false);

  // Customers state
  const [customers, setCustomers] = useState([]);
  const [cSearch, setCSearch] = useState('');
  const [cSearchDraft, setCSearchDraft] = useState('');
  const [cPage, setCPage] = useState(1);
  const [cPagination, setCPagination] = useState({ totalPages: 1, total: 0 });
  const [cLoading, setCLoading] = useState(false);

  // Services state
  const [servicesData, setServicesData] = useState([]);
  const [sLoading, setSLoading] = useState(false);

  // Waitlist state
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  // Blog state
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Change Password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  // Waitlist loaders
  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
      });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const data = await apiGet(`/api/v1/admin/waitlist?${params.toString()}`);
      setItems(data.items || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0, limit });
    } catch (e) {
      setError(e.message || 'Failed to load waitlist');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, limit, sortBy, sortOrder]);

  useEffect(() => { loadItems(); }, [loadItems]);

  // Orders loader
  const loadOrders = useCallback(async () => {
    setOLoading(true);
    try {
      const params = new URLSearchParams({ page: String(oPage), limit: '15' });
      if (oStatus) params.set('status', oStatus);
      const data = await apiGet(`/api/v1/payments/admin/orders?${params.toString()}`);
      setOrders(data.items || []);
      setOPagination(data.pagination || { totalPages: 1, total: 0 });
    } catch {
      showToast('Failed to load orders');
    } finally {
      setOLoading(false);
    }
  }, [oPage, oStatus]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const updateOrderStatus = async (id, status) => {
    try {
      await apiPatch(`/api/v1/payments/admin/orders/${id}`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      showToast('Order status updated');
    } catch {
      showToast('Failed to update status');
    }
  };

  // Customers loader
  const loadCustomers = useCallback(async () => {
    setCLoading(true);
    try {
      const params = new URLSearchParams({ page: String(cPage), limit: '15' });
      if (cSearch) params.set('search', cSearch);
      const data = await apiGet(`/api/v1/admin/customers?${params.toString()}`);
      setCustomers(data.items || []);
      setCPagination(data.pagination || { totalPages: 1, total: 0 });
    } catch {
      showToast('Failed to load customers');
    } finally {
      setCLoading(false);
    }
  }, [cPage, cSearch]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const toggleCustomerActive = async (id, currentStatus) => {
    try {
      await apiPatch(`/api/v1/admin/customers/${id}`, { isActive: !currentStatus });
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
      showToast('Customer account updated');
    } catch {
      showToast('Failed to update customer');
    }
  };

  // Services loaders / handlers
  const loadServices = useCallback(async () => {
    setSLoading(true);
    try {
      const data = await apiGet(`/api/v1/services/admin/all`);
      setServicesData(data.services || []);
    } catch {
      showToast('Failed to load services');
    } finally {
      setSLoading(false);
    }
  }, []);

  useEffect(() => { loadServices(); }, [loadServices]);

  const handleUpdatePathway = async (pathwayId, field, value) => {
    try {
      if (field === 'priceRs') value = Number(value);
      await apiPatch(`/api/v1/services/admin/pathway/${pathwayId}`, { [field]: value });
      
      setServicesData(prev => prev.map(s => {
        return {
          ...s,
          pathways: s.pathways.map(p => p.id === pathwayId ? { ...p, [field]: value } : p)
        };
      }));
      showToast('Pathway updated successfully');
    } catch {
      showToast('Failed to update pathway');
    }
  };

  const handleUpdateService = async (serviceId, field, value) => {
    try {
      await apiPatch(`/api/v1/services/admin/${serviceId}`, { [field]: value });
      setServicesData(prev => prev.map(s => s.id === serviceId ? { ...s, [field]: value } : s));
      showToast('Service updated successfully');
    } catch {
      showToast('Failed to update service');
    }
  };

  // Blog loaders / handlers
  const refreshBlogPosts = useCallback(async () => {
    setBlogLoading(true);
    try {
      const data = await getAllPostsAdmin();
      setBlogPosts(data.items || []);
    } catch {
      setBlogPosts([]);
    } finally {
      setBlogLoading(false);
    }
  }, []);

  useEffect(() => { refreshBlogPosts(); }, [refreshBlogPosts]);

  const handleTogglePublished = async (post) => {
    try {
      await savePost({ ...post, published: !post.published });
      await refreshBlogPosts();
      showToast(post.published ? 'Post set to Draft' : 'Post Published ✓');
    } catch {
      showToast('Failed to update post');
    }
  };

  const handleDeleteBlogPost = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deletePost(id);
      await refreshBlogPosts();
      showToast('Post deleted');
    } catch {
      showToast('Failed to delete post');
    }
  };

  // Change Password handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    setPwSaving(true);
    try {
      await apiPost('/api/v1/auth/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess(true);
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setTimeout(() => logout(), 2000);
    } catch (err) {
      setPwError(err.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  // Waitlist handlers
  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError('');
    try {
      await apiPatch(`/api/v1/admin/waitlist/${id}`, { status });
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
      showToast('Status updated');
    } catch (e) {
      setError(e.message || 'Failed to update status');
      await loadItems();
    } finally {
      setUpdatingId('');
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this waitlist application? This cannot be undone.')) return;
    setDeletingId(id);
    setError('');
    try {
      await apiDelete(`/api/v1/admin/waitlist/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast('Application deleted');
      await loadItems();
    } catch (e) {
      setError(e.message || 'Failed to delete application');
    } finally {
      setDeletingId('');
    }
  };

  const applySearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
  };

  // Render
  return (
    <main
      className="min-h-screen p-6 md:p-8"
      style={{ background: `linear-gradient(160deg, ${C.bg} 0%, #C8EDE9 100%)` }}
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: C.primary }}>Admin Panel</h1>
            <p className="text-sm" style={{ color: C.muted }}>Signed in as {user?.email} ({user?.role})</p>
          </div>
          <button
            className="px-4 py-2 rounded-md text-white"
            style={{ background: C.primary }}
            onClick={logout}
          >
            Logout
          </button>
        </header>

        {/* Tab Switcher */}
        <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: `2px solid ${C.border}` }}>
          {[
            { key: 'waitlist', label: '📋 Waitlist' },
            { key: 'orders',   label: '🛒 Orders' },
            { key: 'customers',label: '👥 Customers' },
            { key: 'services', label: '⚕️ Programs' },
            { key: 'blog',     label: '📝 Blog' },
            { key: 'account',  label: '🔑 Account' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="px-5 py-2.5 rounded-t-lg text-sm font-semibold transition-all"
              style={{
                background: activeTab === key ? '#fff' : 'transparent',
                color: activeTab === key ? C.primary : C.muted,
                borderBottom: activeTab === key ? `2px solid ${C.accent}` : '2px solid transparent',
                marginBottom: '-2px',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Toast */}
        {toast && (
          <p className="text-sm font-medium px-4 py-2 rounded-lg" style={{ background: `${C.accent}18`, color: C.primary }}>
            {toast}
          </p>
        )}

        {/* ── CUSTOMERS TAB ──────────────────────────────────── */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); setCPage(1); setCSearch(cSearchDraft.trim()); }} className="flex gap-3">
              <input
                className="flex-1 max-w-sm rounded-md px-3 py-2"
                style={{ background: '#fff', border: `1px solid ${C.border}` }}
                placeholder="Search name, email, phone..."
                value={cSearchDraft}
                onChange={(e) => setCSearchDraft(e.target.value)}
              />
              <button className="px-4 py-2 rounded-md text-white" style={{ background: C.accent }} type="submit">Search</button>
            </form>

            <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
              <table className="w-full text-left text-sm">
                <thead style={{ background: C.surface }}>
                  <tr>
                    <th className="px-4 py-3 font-semibold" style={{ color: C.muted }}>Name / Email</th>
                    <th className="px-4 py-3 font-semibold" style={{ color: C.muted }}>Phone</th>
                    <th className="px-4 py-3 font-semibold" style={{ color: C.muted }}>Orders</th>
                    <th className="px-4 py-3 font-semibold" style={{ color: C.muted }}>Joined</th>
                    <th className="px-4 py-3 font-semibold" style={{ color: C.muted }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cLoading ? (
                    <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
                  ) : customers.length === 0 ? (
                    <tr><td colSpan="5" className="p-4 text-center text-gray-500">No customers found.</td></tr>
                  ) : (
                    customers.map(c => (
                      <tr key={c.id} className="border-t" style={{ borderColor: C.border }}>
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.email}</p>
                        </td>
                        <td className="px-4 py-3">{c.phone || '—'}</td>
                        <td className="px-4 py-3">{c._count?.orders || 0}</td>
                        <td className="px-4 py-3 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleCustomerActive(c.id, c.isActive)}
                            className={`px-3 py-1 rounded text-xs font-bold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {c.isActive ? 'Active' : 'Suspended'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {cPagination.totalPages > 1 && (
              <div className="flex gap-2">
                <button disabled={cPage <= 1} onClick={() => setCPage(p => Math.max(p - 1, 1))} className="px-3 py-1 bg-white border rounded disabled:opacity-50">Prev</button>
                <button disabled={cPage >= cPagination.totalPages} onClick={() => setCPage(p => Math.min(p + 1, cPagination.totalPages))} className="px-3 py-1 bg-white border rounded disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ─────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex gap-3 mb-4">
              <select
                className="rounded-md px-3 py-2"
                style={{ background: '#fff', border: `1px solid ${C.border}` }}
                value={oStatus}
                onChange={(e) => { setOPage(1); setOStatus(e.target.value); }}
              >
                <option value="">All Statuses</option>
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="CREATED">CREATED</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
              <table className="w-full text-left text-sm">
                <thead style={{ background: C.surface }}>
                  <tr>
                    <th className="px-4 py-3 font-semibold" style={{ color: C.muted }}>Txn ID & Date</th>
                    <th className="px-4 py-3 font-semibold" style={{ color: C.muted }}>Patient</th>
                    <th className="px-4 py-3 font-semibold" style={{ color: C.muted }}>Services Booked</th>
                    <th className="px-4 py-3 font-semibold" style={{ color: C.muted }}>Amount</th>
                    <th className="px-4 py-3 font-semibold" style={{ color: C.muted }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {oLoading ? (
                    <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan="5" className="p-4 text-center text-gray-500">No orders found.</td></tr>
                  ) : (
                    orders.map(o => (
                      <tr key={o.id} className="border-t" style={{ borderColor: C.border }}>
                        <td className="px-4 py-3 align-top">
                          <p className="font-mono text-xs">{o.txnid}</p>
                          <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="font-bold text-gray-900">{o.patientName}</p>
                          <p className="text-xs text-gray-500">{o.patientEmail}</p>
                          <p className="text-xs text-gray-500">{o.patientPhone}</p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {o.items?.map((item, i) => (
                            <div key={item.id} className={i > 0 ? "mt-2 pt-2 border-t border-gray-100" : ""}>
                              <p className="font-medium text-gray-800">{item.service?.title}</p>
                              <p className="text-xs text-gray-500">{item.pathway?.name}</p>
                            </div>
                          ))}
                        </td>
                        <td className="px-4 py-3 align-top font-semibold text-teal-800">
                          ₹{o.totalAmountRs.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <select
                            className="rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider"
                            style={{ 
                              background: o.status === 'PAID' ? '#dcfce7' : o.status === 'FAILED' ? '#fee2e2' : '#fef3c7',
                              color: o.status === 'PAID' ? '#15803d' : o.status === 'FAILED' ? '#b91c1c' : '#b45309',
                              border: `1px solid ${C.border}` 
                            }}
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                          >
                            <option value="CREATED">CREATED</option>
                            <option value="PAID">PAID</option>
                            <option value="FAILED">FAILED</option>
                            <option value="PENDING">PENDING</option>
                            <option value="REFUNDED">REFUNDED</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {oPagination.totalPages > 1 && (
              <div className="flex gap-2">
                <button disabled={oPage <= 1} onClick={() => setOPage(p => Math.max(p - 1, 1))} className="px-3 py-1 bg-white border rounded disabled:opacity-50">Prev</button>
                <button disabled={oPage >= oPagination.totalPages} onClick={() => setOPage(p => Math.min(p + 1, oPagination.totalPages))} className="px-3 py-1 bg-white border rounded disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        )}

        {/* ── SERVICES / PROGRAMS TAB ─────────────────────────────────────── */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: C.primary }}>Program Manager</h2>
              <button 
                onClick={loadServices}
                className="px-4 py-2 rounded-md bg-white border border-gray-200 shadow-sm text-sm"
              >
                Refresh
              </button>
            </div>

            {sLoading ? (
              <p>Loading programs...</p>
            ) : servicesData.length === 0 ? (
              <p>No programs found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {servicesData.map(service => (
                  <div key={service.id} className="bg-white rounded-xl shadow-sm border overflow-hidden p-6" style={{ borderColor: C.border }}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 mr-4">
                        <input
                          type="text"
                          className="text-lg font-bold w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-teal-500 outline-none pb-1 transition-colors"
                          style={{ color: C.primary }}
                          defaultValue={service.title}
                          onBlur={(e) => {
                            if (e.target.value !== service.title) handleUpdateService(service.id, 'title', e.target.value);
                          }}
                        />
                        <textarea
                          className="w-full text-sm mt-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-teal-500 outline-none pb-1 transition-colors resize-none overflow-hidden"
                          style={{ color: C.muted, minHeight: '40px' }}
                          defaultValue={service.description}
                          onBlur={(e) => {
                            if (e.target.value !== service.description) handleUpdateService(service.id, 'description', e.target.value);
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Active</label>
                        <input
                          type="checkbox"
                          className="toggle toggle-sm toggle-success"
                          checked={service.isActive}
                          onChange={(e) => handleUpdateService(service.id, 'isActive', e.target.checked)}
                        />
                      </div>
                    </div>

                    <div className="mt-4 border-t pt-4" style={{ borderColor: C.border }}>
                      <h4 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-500">Pathways / Pricing</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="text-gray-500 border-b">
                              <th className="pb-2 font-semibold">Pathway Name</th>
                              <th className="pb-2 font-semibold">Duration</th>
                              <th className="pb-2 font-semibold">Price (₹)</th>
                              <th className="pb-2 text-right font-semibold">Active</th>
                            </tr>
                          </thead>
                          <tbody>
                            {service.pathways.map(pathway => (
                              <tr key={pathway.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="py-2 pr-2">
                                  <input
                                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-teal-500 outline-none text-gray-800"
                                    defaultValue={pathway.name}
                                    onBlur={(e) => {
                                      if (e.target.value !== pathway.name) handleUpdatePathway(pathway.id, 'name', e.target.value);
                                    }}
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input
                                    className="w-24 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-teal-500 outline-none text-gray-600"
                                    defaultValue={pathway.duration}
                                    onBlur={(e) => {
                                      if (e.target.value !== pathway.duration) handleUpdatePathway(pathway.id, 'duration', e.target.value);
                                    }}
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <div className="flex items-center">
                                    <span className="text-gray-500 mr-1">₹</span>
                                    <input
                                      type="number"
                                      className="w-24 font-mono font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-teal-500 outline-none text-teal-800"
                                      defaultValue={pathway.priceRs}
                                      onBlur={(e) => {
                                        if (Number(e.target.value) !== pathway.priceRs) handleUpdatePathway(pathway.id, 'priceRs', e.target.value);
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="py-2 text-right">
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm checkbox-success"
                                    checked={pathway.isActive}
                                    onChange={(e) => handleUpdatePathway(pathway.id, 'isActive', e.target.checked)}
                                  />
                                </td>
                              </tr>
                            ))}
                            {service.pathways.length === 0 && (
                              <tr>
                                <td colSpan="4" className="py-3 text-center text-gray-400 italic">No pathways created for this program.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BLOG TAB ───────────────────────────────────────── */}

        {activeTab === 'blog' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: C.muted }}>
                {blogPosts.length} post{blogPosts.length !== 1 ? 's' : ''} total
              </p>
              <Link
                to="/admin/blog/new"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: C.accent }}
              >
                <PlusCircle size={15} /> New Post
              </Link>
            </div>

            {blogLoading ? (
              <div className="grid gap-3">
                {[1,2,3].map((n) => (
                  <div key={n} className="h-20 rounded-xl animate-pulse" style={{ background: C.surface, border: `1px solid ${C.border}` }} />
                ))}
              </div>
            ) : blogPosts.length === 0 ? (
              <div
                className="text-center py-16 rounded-xl"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}
              >
                <p className="text-4xl mb-3">📝</p>
                <p className="font-semibold" style={{ color: C.primary }}>No blog posts yet</p>
                <p className="text-sm mt-1" style={{ color: C.muted }}>Click "New Post" to create your first one.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {blogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl"
                    style={{ background: C.surface, border: `1px solid ${C.border}` }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {post.coverImage && (
                        <img
                          src={post.coverImage}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: C.primary }}>{post.title}</p>
                        <p className="text-xs" style={{ color: C.muted }}>
                          {post.category} · {post.date ? new Date(post.date).toLocaleDateString('en-IN') : ''}
                          <span
                            className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              background: post.published ? '#D1FAE5' : '#FEF3C7',
                              color: post.published ? '#065F46' : '#92400E',
                            }}
                          >
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePublished(post)}
                        title={post.published ? 'Set to Draft' : 'Publish'}
                        className="p-2 rounded-lg"
                        style={{ background: '#F0FDF4', border: `1px solid ${C.border}`, color: C.accent }}
                      >
                        {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <Link
                        to={`/admin/blog/edit/${post.id}`}
                        className="p-2 rounded-lg"
                        style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted }}
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDeleteBlogPost(post.id, post.title)}
                        className="p-2 rounded-lg"
                        style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── WAITLIST TAB ───────────────────────────────────── */}
        {activeTab === 'waitlist' && (
          <>
            <form
              className="rounded-xl p-3 md:p-4 flex flex-wrap gap-3 items-center"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
              onSubmit={applySearch}
            >
              <input
                className="flex-1 min-w-[220px] rounded-md px-3 py-2"
                style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.primary }}
                placeholder="Search by name, email, or rationale"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
              />
              <select
                className="rounded-md px-3 py-2"
                style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.primary }}
                value={limit}
                onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <select
                className="rounded-md px-3 py-2"
                style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.primary }}
                value={statusFilter}
                onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
              >
                <option value="">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select
                className="rounded-md px-3 py-2"
                style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.primary }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Sort: Created</option>
                <option value="updatedAt">Sort: Updated</option>
              </select>
              <button
                className="px-3 py-2 rounded-md"
                style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.primary }}
                type="button"
                onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              >
                {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
              </button>
              <button className="px-4 py-2 rounded-md text-white" style={{ background: C.accent }} type="submit">Apply</button>
              <button
                className="px-4 py-2 rounded-md"
                style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.primary }}
                type="button"
                onClick={() => {
                  setSearchDraft('');
                  setSearch('');
                  setStatusFilter('');
                  setSortBy('createdAt');
                  setSortOrder('desc');
                  setPage(1);
                  setLimit(10);
                }}
              >
                Reset
              </button>
              <button
                className="px-4 py-2 rounded-md"
                style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.primary }}
                type="button"
                onClick={loadItems}
              >
                Refresh
              </button>
            </form>

            {error && <p className="text-red-600">{error}</p>}

            {loading ? (
              <div className="grid gap-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="h-24 rounded-xl animate-pulse" style={{ background: '#eef8f6', border: `1px solid ${C.border}` }} />
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {items.map((item) => (
                  <article key={item.id} className="rounded-xl p-4 shadow-sm" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <h2 className="font-semibold" style={{ color: C.primary }}>{item.fullName}</h2>
                        <p className="text-sm" style={{ color: C.muted }}>{item.email}</p>
                        <p className="text-sm mt-1" style={{ color: C.muted }}>{item.healthVector || 'No health vector selected'}</p>
                      </div>
                      <div className="flex gap-2 items-start flex-wrap justify-end">
                        <span className="text-xs px-2 py-1 rounded" style={{ background: `${C.accent}22`, color: C.primary }}>{item.status}</span>
                        <select
                          className="rounded-md px-2 py-1 text-sm"
                          style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.primary }}
                          value={item.status}
                          disabled={updatingId === item.id || deletingId === item.id}
                          onChange={(e) => updateStatus(item.id, e.target.value)}
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <button
                          className="px-3 py-1 rounded-md text-sm text-white disabled:opacity-60"
                          style={{ background: '#b91c1c' }}
                          disabled={deletingId === item.id || updatingId === item.id}
                          onClick={() => deleteItem(item.id)}
                        >
                          {deletingId === item.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 bg-white p-3 rounded border border-[rgba(6,41,38,0.1)]">
                      <p className="text-sm font-semibold mb-1" style={{ color: C.primary }}>Rationale:</p>
                      <p
                        className="text-sm whitespace-pre-wrap"
                        style={{ color: C.muted }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.rationale) }}
                      />
                    </div>
                    <div className="mt-3">
                      <label className="text-sm font-semibold block mb-1" style={{ color: C.primary }}>Admin Notes:</label>
                      <div className="flex gap-2">
                        <textarea
                          className="flex-1 rounded-md px-3 py-2 text-sm"
                          style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.primary, minHeight: '60px' }}
                          placeholder="Add private notes here..."
                          defaultValue={item.adminNotes || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (item.adminNotes || '')) {
                              apiPatch(`/api/v1/admin/waitlist/${item.id}`, { adminNotes: e.target.value })
                                .then(() => showToast('Notes saved'))
                                .catch((err) => setError(err.message || 'Failed to save notes'));
                            }
                          }}
                        />
                      </div>
                    </div>
                  </article>
                ))}
                {!items.length && <p style={{ color: C.muted }}>No applications yet.</p>}
              </div>
            )}

            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-3"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <p className="text-sm" style={{ color: C.muted }}>
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 rounded-md disabled:opacity-50"
                  style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.primary }}
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-2 rounded-md disabled:opacity-50"
                  style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.primary }}
                  disabled={page >= pagination.totalPages || loading}
                  onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── ACCOUNT TAB ─────────────────────────────────────── */}
        {activeTab === 'account' && (
          <div className="max-w-md">
            <div className="rounded-2xl p-8" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg" style={{ background: `${C.accent}18` }}>
                  <KeyRound size={18} style={{ color: C.accent }} />
                </div>
                <div>
                  <h2 className="font-bold text-lg" style={{ color: C.primary }}>Change Password</h2>
                  <p className="text-xs" style={{ color: C.muted }}>Changing password will log you out of all devices.</p>
                </div>
              </div>

              {pwSuccess ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-3">✅</p>
                  <p className="font-semibold" style={{ color: C.primary }}>Password changed!</p>
                  <p className="text-sm mt-1" style={{ color: C.muted }}>Logging you out in 2 seconds…</p>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {pwError && (
                    <p className="text-sm px-3 py-2 rounded-lg" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
                      {pwError}
                    </p>
                  )}
                  {[['currentPassword','Current Password','password'],['newPassword','New Password','password'],['confirm','Confirm New Password','password']].map(([field, label, type]) => (
                    <div key={field}>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: C.muted }}>{label}</label>
                      <input
                        type={type}
                        required
                        minLength={8}
                        value={pwForm[field]}
                        onChange={(e) => setPwForm((prev) => ({ ...prev, [field]: e.target.value }))}
                        className="w-full rounded-lg px-3 py-2.5 text-sm"
                        style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.primary, outline: 'none' }}
                        placeholder="••••••••"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mt-2"
                    style={{ background: pwSaving ? '#90cbc4' : C.accent, cursor: pwSaving ? 'not-allowed' : 'pointer' }}
                  >
                    {pwSaving ? 'Changing…' : 'Change Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
