/**
 * Checkout.jsx — /checkout
 * 3-step checkout: Review cart → Patient details → Redirect to PayU
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, User, CreditCard, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const C = {
  bg:      '#DCF4F1',
  primary: '#062926',
  accent:  '#2AB5A5',
  muted:   '#4A7C78',
  surface: 'rgba(255,255,255,0.9)',
  border:  'rgba(6,41,38,0.12)',
};

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function formatPrice(rs) {
  return `₹${Number(rs).toLocaleString('en-IN')}`;
}

function StepBadge({ n, label, active, done }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
        style={{
          background: done ? '#16a34a' : active ? C.accent : `${C.accent}20`,
          color:      done || active ? '#fff' : C.muted,
        }}
      >
        {done ? '✓' : n}
      </div>
      <span
        className="text-sm font-semibold hidden sm:inline"
        style={{ color: active || done ? C.primary : C.muted }}
      >
        {label}
      </span>
    </div>
  );
}

export default function Checkout() {
  const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep]     = useState(1); // 1=review, 2=details, 3=paying
  const [form, setForm]     = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate() {
    const e = {};
    if (!form.name.trim())                          e.name  = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!/^[0-9]{10}$/.test(form.phone.replace(/\s/g, ''))) e.phone = '10-digit phone required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit to backend, then auto-POST to PayU ────────────────────────────
  async function handlePay(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      const res = await fetch(`${API}/api/v1/payments/initiate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName:  form.name,
          patientEmail: form.email,
          patientPhone: form.phone,
          items: cartItems.map((i) => ({ serviceId: i.serviceId, pathwayId: i.pathwayId })),
        }),
      });

      const data = await res.json();
      if (!res.ok) { setApiError(data.message || 'Something went wrong.'); setLoading(false); return; }

      // Clear cart before redirect
      clearCart();

      // Auto-submit hidden form to PayU
      const form_ = document.createElement('form');
      form_.method = 'POST';
      form_.action = data.payuUrl;
      Object.entries(data.params).forEach(([k, v]) => {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = k; input.value = v ?? '';
        form_.appendChild(input);
      });
      document.body.appendChild(form_);
      form_.submit();
    } catch {
      setApiError('Network error — please try again.');
      setLoading(false);
    }
  }

  // ── Empty cart state ──────────────────────────────────────────────────────
  if (cartItems.length === 0 && step === 1) {
    return (
      <main
        className="w-full min-h-screen pt-[110px] md:pt-[140px] pb-32 px-6 md:px-12 flex items-center justify-center"
        style={{ background: `linear-gradient(160deg, ${C.bg} 0%, #C8EDE9 100%)` }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center flex flex-col items-center gap-5"
        >
          <ShoppingBag size={56} style={{ color: `${C.accent}50` }} />
          <h1 className="text-3xl font-bold" style={{ color: C.primary }}>Your cart is empty</h1>
          <p style={{ color: C.muted }}>Add programs from our Services page to continue.</p>
          <Link
            to="/services"
            className="px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:scale-105"
            style={{ background: C.accent, color: '#fff' }}
          >
            Browse Programs <ArrowRight size={15} />
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main
      className="w-full min-h-screen pt-[110px] md:pt-[140px] pb-32 px-6 md:px-12"
      style={{ background: `linear-gradient(160deg, ${C.bg} 0%, #C8EDE9 100%)` }}
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-bold text-xs tracking-widest uppercase mb-2" style={{ color: C.accent }}>
            Checkout
          </p>
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: C.primary }}>
            Complete Your Booking
          </h1>
        </motion.div>

        {/* Step Indicators */}
        <div className="flex items-center gap-4">
          <StepBadge n={1} label="Review Cart"   active={step === 1} done={step > 1} />
          <div className="flex-1 h-px" style={{ background: C.border }} />
          <StepBadge n={2} label="Your Details"  active={step === 2} done={step > 2} />
          <div className="flex-1 h-px" style={{ background: C.border }} />
          <StepBadge n={3} label="Payment"       active={step === 3} done={false} />
        </div>

        {/* ── Step 1: Review cart ───────────────────────────────────────── */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
            {cartItems.map((item) => (
              <div
                key={`${item.serviceId}-${item.pathwayId}`}
                className="rounded-2xl p-5 flex items-start justify-between gap-4"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base" style={{ color: C.primary }}>{item.serviceTitle}</p>
                  <p className="text-sm mt-0.5" style={{ color: C.muted }}>
                    {item.pathwayName} · {item.duration}
                  </p>
                  <p className="font-bold text-lg mt-2" style={{ color: C.accent }}>
                    {formatPrice(item.priceRs)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.serviceId)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            ))}

            {/* Total */}
            <div
              className="rounded-2xl p-5 flex items-center justify-between"
              style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}30` }}
            >
              <span className="font-bold text-lg" style={{ color: C.primary }}>Total</span>
              <span className="font-bold text-2xl" style={{ color: C.primary }}>{formatPrice(cartTotal)}</span>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{ background: C.accent, color: '#fff', boxShadow: `0 6px 20px ${C.accent}40` }}
            >
              Continue to Details <ArrowRight size={16} />
            </button>
          </motion.div>
        )}

        {/* ── Step 2: Patient details ──────────────────────────────────────── */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <form onSubmit={handlePay} className="flex flex-col gap-5">
              <div
                className="rounded-2xl p-6 md:p-8 flex flex-col gap-5"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User size={18} style={{ color: C.accent }} />
                  <span className="font-bold text-sm tracking-widest uppercase" style={{ color: C.muted }}>
                    Patient Information
                  </span>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold" style={{ color: C.primary }}>Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Dr. Priya Sharma"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      border: `1.5px solid ${errors.name ? '#ef4444' : C.border}`,
                      background: '#f8fffe',
                      color: C.primary,
                    }}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold" style={{ color: C.primary }}>Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="priya@email.com"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      border: `1.5px solid ${errors.email ? '#ef4444' : C.border}`,
                      background: '#f8fffe',
                      color: C.primary,
                    }}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold" style={{ color: C.primary }}>Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      border: `1.5px solid ${errors.phone ? '#ef4444' : C.border}`,
                      background: '#f8fffe',
                      color: C.primary,
                    }}
                  />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>

                {apiError && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3">{apiError}</p>
                )}
              </div>

              {/* Order summary mini */}
              <div
                className="rounded-xl px-5 py-3 flex items-center justify-between"
                style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}25` }}
              >
                <span className="text-sm" style={{ color: C.muted }}>
                  {cartItems.length} program{cartItems.length > 1 ? 's' : ''}
                </span>
                <span className="font-bold" style={{ color: C.primary }}>{formatPrice(cartTotal)}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white"
                  style={{ border: `1.5px solid ${C.border}`, color: C.muted }}
                >
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: C.accent, color: '#fff', boxShadow: `0 6px 20px ${C.accent}40` }}
                >
                  <CreditCard size={16} />
                  {loading ? 'Redirecting to PayU…' : `Pay ${formatPrice(cartTotal)} →`}
                </button>
              </div>

              <p className="text-xs text-center" style={{ color: C.muted }}>
                🔒 Secured by PayU Money · Your data is encrypted
              </p>
            </form>
          </motion.div>
        )}
      </div>
    </main>
  );
}
