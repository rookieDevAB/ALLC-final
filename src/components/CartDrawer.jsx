/**
 * CartDrawer.jsx
 * Slide-in cart panel from the right side.
 * Opens when user clicks the cart icon in the navbar.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const C = {
  bg:      '#DCF4F1',
  primary: '#062926',
  accent:  '#2AB5A5',
  muted:   '#4A7C78',
  surface: '#ffffff',
  border:  'rgba(6,41,38,0.12)',
};

function formatPrice(rs) {
  return `₹${Number(rs).toLocaleString('en-IN')}`;
}

export default function CartDrawer({ open, onClose }) {
  const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(6,41,38,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl"
            style={{
              width: 'min(420px, 100vw)',
              background: C.surface,
              borderLeft: `1px solid ${C.border}`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} style={{ color: C.accent }} />
                <span className="font-bold text-lg" style={{ color: C.primary }}>
                  Selected Programs
                </span>
                {cartItems.length > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: C.accent, color: '#fff' }}
                  >
                    {cartItems.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                aria-label="Close cart"
              >
                <X size={18} style={{ color: C.muted }} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag size={48} style={{ color: `${C.accent}40` }} />
                  <p className="font-semibold text-lg" style={{ color: C.primary }}>
                    Your cart is empty
                  </p>
                  <p className="text-sm" style={{ color: C.muted }}>
                    Browse our clinical programs and add one to get started.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: C.accent, color: '#fff' }}
                  >
                    Browse Programs
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    key={`${item.serviceId}-${item.pathwayId}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className="rounded-xl p-4 flex flex-col gap-2"
                    style={{ background: C.bg, border: `1px solid ${C.border}` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-snug" style={{ color: C.primary }}>
                          {item.serviceTitle}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                          {item.pathwayName} · {item.duration}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.serviceId)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50 shrink-0"
                        aria-label="Remove"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                    <p className="font-bold text-base" style={{ color: C.accent }}>
                      {formatPrice(item.priceRs)}
                    </p>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div
                className="px-6 py-5 flex flex-col gap-3"
                style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm" style={{ color: C.muted }}>
                    Total
                  </span>
                  <span className="font-bold text-2xl" style={{ color: C.primary }}>
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: C.accent, color: '#fff', boxShadow: `0 4px 16px ${C.accent}40` }}
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </button>
                <button
                  onClick={clearCart}
                  className="text-xs text-center transition-colors hover:underline"
                  style={{ color: C.muted }}
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
