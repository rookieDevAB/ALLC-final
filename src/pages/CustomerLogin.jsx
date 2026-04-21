import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

const C = {
  primary: '#062926',
  accent:  '#2AB5A5',
  muted:   '#527B78',
  bg:      '#f8fffe',
  border:  'rgba(6,41,38,0.12)',
};

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function CustomerLogin() {
  const [isLogin, setIsLogin]   = useState(true);
  const [form, setForm]         = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  
  const { setSession } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/v1/customer/login' : '/api/v1/customer/register';
    
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? { email: form.email, password: form.password } : form),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || 'Something went wrong.');
      } else {
        setSession(data.accessToken, data.customer);
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen py-32 px-6 flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #DCF4F1 0%, #C8EDE9 100%)' }}
    >
      {/* Decorative Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-40 bg-[#2AB5A5] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 bg-[#4A7C78] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl relative z-10"
        style={{ border: `1px solid ${C.border}` }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: C.primary }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm" style={{ color: C.muted }}>
            {isLogin ? 'Sign in to view your reports and programs.' : 'Register to manage your treatments and records.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-4"
              >
                {/* Name */}
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-none outline-none text-sm transition-all bg-white"
                    style={{ color: C.primary, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                  <input
                    type="tel"
                    placeholder="Phone Number (Optional)"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-none outline-none text-sm transition-all bg-white"
                    style={{ color: C.primary, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
            <input
              type="email"
              required
              placeholder="Email Address *"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-none outline-none text-sm transition-all bg-white"
              style={{ color: C.primary, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
            <input
              type="password"
              required
              placeholder="Password *"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-none outline-none text-sm transition-all bg-white"
              style={{ color: C.primary, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-xs font-semibold text-center mt-2"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 mt-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{ background: C.accent, boxShadow: `0 6px 20px ${C.accent}40` }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-8 text-center border-t pt-6" style={{ borderColor: C.border }}>
          <p className="text-sm" style={{ color: C.muted }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={handleToggle}
              className="ml-2 font-bold transition-colors hover:underline"
              style={{ color: C.accent }}
            >
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
