import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Package, Clock, LogOut, CheckCircle, FileText } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useNavigate } from 'react-router-dom';

const C = {
  primary: '#062926',
  accent:  '#2AB5A5',
  muted:   '#527B78',
  bg:      '#DCF4F1',
  surface: 'rgba(255,255,255,0.95)',
  border:  'rgba(6,41,38,0.12)',
};

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function formatPrice(rs) {
  return `₹${Number(rs).toLocaleString('en-IN')}`;
}

export default function CustomerDashboard() {
  const { customer, accessToken, logout } = useCustomerAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!accessToken) return;
      try {
        const headers = { Authorization: `Bearer ${accessToken}` };
        const [ordRes, subRes] = await Promise.all([
          fetch(`${API}/api/v1/customer/orders`, { headers }),
          fetch(`${API}/api/v1/customer/subscriptions`, { headers })
        ]);

        if (ordRes.ok) {
          const ordData = await ordRes.json();
          setOrders(ordData.orders || []);
        }
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscriptions(subData.subscriptions || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [accessToken]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <main
      className="min-h-screen pt-32 pb-24 px-6 md:px-12"
      style={{ background: `linear-gradient(160deg, ${C.bg} 0%, #C8EDE9 100%)` }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        
        {/* Header section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/70 backdrop-blur-xl rounded-3xl p-8" style={{ border: `1px solid ${C.border}` }}>
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: C.primary }}>Patient Dashboard</h1>
            <p style={{ color: C.muted }}>Welcome back, <strong style={{ color: C.primary }}>{customer?.name}</strong></p>
          </div>
          <button
            onClick={handleLogout}
            className="self-start md:self-auto px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors bg-white hover:bg-gray-50 text-red-500 shadow-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Active Subscriptions (Programs) */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: C.border }}>
              <Package style={{ color: C.accent }} />
              <h2 className="text-2xl font-bold" style={{ color: C.primary }}>My Programs</h2>
            </div>
            
            {loading ? (
              <LoadingPulse />
            ) : subscriptions.length === 0 ? (
              <EmptyState title="No active programs" desc="You don't have any ongoing medical programs." />
            ) : (
              <div className="flex flex-col gap-4">
                {subscriptions.map(sub => (
                  <motion.div
                    key={sub.orderItemId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border"
                    style={{ borderColor: C.border }}
                  >
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded" style={{ background: `${C.accent}20`, color: C.accent }}>
                          {sub.category}
                        </span>
                        <h3 className="text-lg font-bold mt-2" style={{ color: C.primary }}>{sub.serviceTitle}</h3>
                        <p className="text-sm font-semibold" style={{ color: C.muted }}>{sub.pathwayName} · {sub.duration}</p>
                      </div>
                      <CheckCircle className="shrink-0" style={{ color: sub.isActive ? C.accent : C.muted }} />
                    </div>

                    {/* Progress Bar (if duration has days) */}
                    {sub.totalDays > 0 && (
                      <div className="mt-6 flex flex-col gap-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span style={{ color: C.accent }}>{sub.daysElapsed} days elapsed</span>
                          <span style={{ color: C.muted }}>{sub.daysLeft} days left</span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: `${C.accent}20` }}>
                          <div 
                            className="h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${sub.progressPct}%`, background: C.accent }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Past Orders History */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: C.border }}>
              <FileText style={{ color: C.accent }} />
              <h2 className="text-2xl font-bold" style={{ color: C.primary }}>Order History</h2>
            </div>

            {loading ? (
              <LoadingPulse />
            ) : orders.length === 0 ? (
              <EmptyState title="No orders found" desc="You haven't placed any bookings yet." />
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map(order => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border flex flex-col gap-4"
                    style={{ borderColor: C.border }}
                  >
                    <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: `${C.border}` }}>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} style={{ color: C.muted }} />
                        <span className="text-sm font-semibold" style={{ color: C.primary }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {order.items.map(i => (
                        <div key={i.id} className="flex justify-between items-start text-sm">
                          <span style={{ color: C.primary }}>{i.service.title} <span style={{ color: C.muted }}>({i.pathway.name})</span></span>
                          <span className="font-semibold shrink-0" style={{ color: C.accent }}>{formatPrice(i.priceRs)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-end pt-3 mt-2 border-t" style={{ borderColor: `${C.border}` }}>
                      <span className="text-xs font-mono" style={{ color: C.muted }}>{order.txnid}</span>
                      <span className="font-bold text-lg" style={{ color: C.primary }}>{formatPrice(order.totalAmountRs)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }) {
  let color = '#6b7280', bg = '#f3f4f6';
  if (status === 'PAID') { color = '#15803d'; bg = '#dcfce7'; }
  if (status === 'FAILED') { color = '#b91c1c'; bg = '#fee2e2'; }
  if (status === 'CREATED' || status === 'PENDING') { color = '#b45309'; bg = '#fef3c7'; }

  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider" style={{ color, background: bg }}>
      {status}
    </span>
  );
}

function LoadingPulse() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-24 bg-white/50 rounded-2xl" />
      <div className="h-24 bg-white/50 rounded-2xl" />
    </div>
  );
}

function EmptyState({ title, desc }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center bg-white/40 rounded-2xl border border-dashed border-[#b4e6e1]">
      <Clock size={32} style={{ color: '#8ecbc4', marginBottom: 8 }} />
      <h3 className="font-bold text-lg" style={{ color: '#062926' }}>{title}</h3>
      <p className="text-sm" style={{ color: '#527B78' }}>{desc}</p>
    </div>
  );
}
