/**
 * BookingFailed.jsx — /booking-failed?txnid=ALLC-xxx
 * Shown when PayU reports a failed payment.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, Phone } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const C = {
  bg:      '#DCF4F1',
  primary: '#062926',
  accent:  '#2AB5A5',
  muted:   '#4A7C78',
  surface: 'rgba(255,255,255,0.9)',
  border:  'rgba(6,41,38,0.12)',
};

export default function BookingFailed() {
  const [params] = useSearchParams();
  const txnid    = params.get('txnid') || '';
  const reason   = params.get('reason') || '';

  return (
    <main
      className="w-full min-h-screen pt-[110px] md:pt-[140px] pb-32 px-6 md:px-12 flex items-center justify-center"
      style={{ background: `linear-gradient(160deg, ${C.bg} 0%, #C8EDE9 100%)` }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md flex flex-col gap-5"
      >
        <div
          className="rounded-3xl overflow-hidden shadow-xl"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          {/* Header */}
          <div
            className="px-8 py-8 flex flex-col items-center gap-3 text-center"
            style={{ background: '#1a0000' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            >
              <XCircle size={52} className="text-red-400" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
            <p className="text-sm text-red-200">
              {reason === 'hash_mismatch'
                ? 'Security verification failed. Please try again.'
                : 'Your payment could not be processed. No amount has been charged.'}
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-6 flex flex-col gap-4">
            {txnid && (
              <div
                className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: '#fff0f0', border: '1px solid #fca5a5' }}
              >
                <span className="text-xs font-bold uppercase tracking-widest text-red-400">Reference</span>
                <span className="font-mono text-sm font-bold" style={{ color: C.primary }}>{txnid}</span>
              </div>
            )}

            <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
              This can happen due to a cancelled payment, bank issues, or a network timeout.
              Your cart has been cleared — please go back and re-add your programs to try again.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/services"
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{ background: C.accent, color: '#fff' }}
              >
                <ArrowLeft size={15} /> Try Again
              </Link>
              <Link
                to="/contact"
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all hover:bg-teal-50"
                style={{ border: `1.5px solid ${C.border}`, color: C.muted }}
              >
                <Phone size={14} /> Contact Support
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
