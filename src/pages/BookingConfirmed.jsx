/**
 * BookingConfirmed.jsx — /booking-confirmed?txnid=ALLC-xxx
 * Shown after successful PayU payment.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

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

export default function BookingConfirmed() {
  const [params]   = useSearchParams();
  const txnid      = params.get('txnid') || '';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!txnid) { setLoading(false); return; }
    fetch(`${API}/api/v1/payments/order/${txnid}`)
      .then((r) => r.json())
      .then((d) => { setOrder(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [txnid]);

  return (
    <main
      className="w-full min-h-screen pt-[110px] md:pt-[140px] pb-32 px-6 md:px-12 flex items-center justify-center"
      style={{ background: `linear-gradient(160deg, ${C.bg} 0%, #C8EDE9 100%)` }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg flex flex-col gap-6"
      >
        {/* Success card */}
        <div
          className="rounded-3xl overflow-hidden shadow-xl"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          {/* Teal header */}
          <div
            className="px-8 py-8 flex flex-col items-center gap-3 text-center"
            style={{ background: '#062926' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle size={56} style={{ color: C.accent }} />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
            <p className="text-sm" style={{ color: '#94d8d3' }}>
              Your booking is confirmed. A confirmation email has been sent.
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-6 flex flex-col gap-5">
            {loading ? (
              <div className="flex flex-col gap-3 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-5 rounded" style={{ background: `${C.accent}20` }} />
                ))}
              </div>
            ) : order ? (
              <>
                {/* Booking ID */}
                <div
                  className="rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}25` }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>Booking ID</span>
                  <span className="font-mono font-bold text-sm" style={{ color: C.primary }}>{order.txnid}</span>
                </div>

                {/* Patient */}
                <div>
                  <p className="text-sm" style={{ color: C.muted }}>
                    <span className="font-semibold" style={{ color: C.primary }}>{order.patientName}</span>
                    {' · '}{order.patientEmail}
                  </p>
                </div>

                {/* Programs */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>Programs Booked</p>
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                      style={{ background: C.bg, border: `1px solid ${C.border}` }}
                    >
                      <div>
                        <p className="font-semibold text-sm" style={{ color: C.primary }}>{item.serviceTitle}</p>
                        <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                          {item.pathwayName} · {item.duration}
                        </p>
                      </div>
                      <span className="font-bold text-sm shrink-0" style={{ color: C.accent }}>
                        {formatPrice(item.priceRs)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div
                  className="rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}25` }}
                >
                  <span className="font-bold" style={{ color: C.primary }}>Total Paid</span>
                  <span className="font-bold text-xl" style={{ color: C.primary }}>
                    {formatPrice(order.totalAmountRs)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-center" style={{ color: C.muted }}>
                Your payment was successful. Our team will contact you within 24 hours.
              </p>
            )}

            {/* Next step note */}
            <div
              className="rounded-xl px-4 py-3 text-sm leading-relaxed"
              style={{ background: `${C.accent}08`, border: `1px solid ${C.accent}20` }}
            >
              <p style={{ color: C.primary }}>
                📞 Our team will reach out within <strong>24 hours</strong> to schedule your first session.
                Supervised by <strong>Dr. Divya Gautam</strong>.
              </p>
            </div>

            <Link
              to="/"
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{ background: C.accent, color: '#fff' }}
            >
              Back to Home <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
