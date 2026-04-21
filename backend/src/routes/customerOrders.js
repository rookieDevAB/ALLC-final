/**
 * customerOrders.js
 * Patient order history — scoped to logged-in customer.
 *
 * Routes:
 *   GET /api/v1/customer/orders         → paginated order list
 *   GET /api/v1/customer/orders/:txnid  → single order detail
 */

import express from 'express';
import { prisma } from '../db.js';
import { customerGuard } from './customerAuth.js';

const router = express.Router();

// Common select shape for order list items
const ORDER_SELECT = {
  id:            true,
  txnid:         true,
  totalAmountRs: true,
  status:        true,
  payuStatus:    true,
  patientName:   true,
  patientEmail:  true,
  patientPhone:  true,
  createdAt:     true,
  items: {
    select: {
      id:      true,
      priceRs: true,
      service: { select: { id: true, title: true, programNumber: true, category: true } },
      pathway: { select: { id: true, name: true, duration: true } },
    },
  },
};

/**
 * GET /api/v1/customer/orders
 * Returns all orders belonging to the logged-in customer (by email linkage).
 */
router.get('/orders', customerGuard, async (req, res) => {
  const page  = Math.max(Number(req.query.page  || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);
  const skip  = (page - 1) * limit;

  // Fetch by customerId (linked orders) OR by patientEmail (unlinked orders from before signup)
  const customer = await prisma.customer.findUnique({ where: { id: req.customer.sub } });
  if (!customer) return res.status(404).json({ message: 'Customer not found.' });

  const where = {
    OR: [
      { customerId: customer.id },
      { patientEmail: customer.email },
    ],
  };

  const [orders, total] = await Promise.all([
    prisma.serviceOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take:  limit,
      select: ORDER_SELECT,
    }),
    prisma.serviceOrder.count({ where }),
  ]);

  return res.json({
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
});

/**
 * GET /api/v1/customer/orders/:txnid
 * Returns a single order — verifies it belongs to this customer.
 */
router.get('/orders/:txnid', customerGuard, async (req, res) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.customer.sub } });
  if (!customer) return res.status(404).json({ message: 'Customer not found.' });

  const order = await prisma.serviceOrder.findFirst({
    where: {
      txnid: req.params.txnid,
      OR: [
        { customerId: customer.id },
        { patientEmail: customer.email },
      ],
    },
    select: ORDER_SELECT,
  });

  if (!order) return res.status(404).json({ message: 'Order not found.' });
  return res.json({ order });
});

/**
 * GET /api/v1/customer/subscriptions
 * Returns active (PAID) services as "subscriptions" with progress data.
 * Each item includes days elapsed vs total program duration.
 */
router.get('/subscriptions', customerGuard, async (req, res) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.customer.sub } });
  if (!customer) return res.status(404).json({ message: 'Customer not found.' });

  const paidOrders = await prisma.serviceOrder.findMany({
    where: {
      status: 'PAID',
      OR: [
        { customerId: customer.id },
        { patientEmail: customer.email },
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: {
      txnid:     true,
      createdAt: true,
      items: {
        select: {
          id:      true,
          priceRs: true,
          service: { select: { id: true, title: true, programNumber: true, category: true } },
          pathway: { select: { id: true, name: true, duration: true } },
        },
      },
    },
  });

  // Flatten to per-item subscriptions with progress
  const subscriptions = paidOrders.flatMap((order) =>
    order.items.map((item) => {
      const startDate    = new Date(order.createdAt);
      const totalDays    = parseDurationToDays(item.pathway.duration);
      const daysElapsed  = Math.floor((Date.now() - startDate.getTime()) / 86_400_000);
      const daysLeft     = Math.max(totalDays - daysElapsed, 0);
      const progressPct  = totalDays > 0 ? Math.min(Math.round((daysElapsed / totalDays) * 100), 100) : 0;
      const isActive     = daysLeft > 0;

      return {
        orderItemId:   item.id,
        txnid:         order.txnid,
        serviceId:     item.service.id,
        serviceTitle:  item.service.title,
        programNumber: item.service.programNumber,
        category:      item.service.category,
        pathwayName:   item.pathway.name,
        duration:      item.pathway.duration,
        priceRs:       item.priceRs,
        startDate:     startDate.toISOString(),
        totalDays,
        daysElapsed,
        daysLeft,
        progressPct,
        isActive,
      };
    }),
  );

  return res.json({ subscriptions });
});

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Parse duration strings like "3 Months", "9 Months", "12 Months",
 * "60 Min", "Custom" into approximate total days.
 */
function parseDurationToDays(duration) {
  if (!duration) return 0;
  const lower = duration.toLowerCase();
  const num   = parseInt(lower, 10);
  if (isNaN(num)) return 0;
  if (lower.includes('month')) return num * 30;
  if (lower.includes('day'))   return num;
  if (lower.includes('week'))  return num * 7;
  if (lower.includes('year'))  return num * 365;
  return 0; // "Custom", "60 Min" etc → 0 = no progress bar
}

export default router;
