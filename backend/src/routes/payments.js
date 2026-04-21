/* global process */
/**
 * payments.js — PayU Money payment gateway routes
 *
 * Sandbox credentials (public test keys from PayU):
 *   Key:  gtKFFx
 *   Salt: eCwWELxi
 *   URL:  https://test.payu.in/_payment
 *
 * Hash formula (SHA-512):
 *   key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
 *
 * Response verification (reverse hash):
 *   SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
 */

import express from 'express';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { authGuard, roleGuard } from '../middleware/auth.js';
import { Role } from '@prisma/client';
import { sendBookingConfirmation } from '../utils/email.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// ─── PayU config ──────────────────────────────────────────────────────────────
const PAYU_KEY  = process.env.PAYU_MERCHANT_KEY  || 'gtKFFx';
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT || 'eCwWELxi';
const PAYU_MODE = process.env.PAYU_MODE          || 'test';
const PAYU_URL  = PAYU_MODE === 'prod'
  ? 'https://secure.payu.in/_payment'
  : 'https://test.payu.in/_payment';

const BACKEND_URL  = process.env.BACKEND_URL    || 'http://localhost:4000';
const FRONTEND_URL = process.env.FRONTEND_URL   || 'http://localhost:5173';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateTxnId() {
  const ts  = Date.now();
  const rnd = crypto.randomBytes(3).toString('hex');
  return `ALLC-${ts}-${rnd}`;
}

function buildPayUHash(params) {
  const str = [
    PAYU_KEY,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 || '',
    params.udf2 || '',
    params.udf3 || '',
    params.udf4 || '',
    params.udf5 || '',
    '', '', '', '', '', '',
    PAYU_SALT,
  ].join('|');
  return crypto.createHash('sha512').update(str).digest('hex');
}

function verifyPayUResponseHash(resp) {
  // Reverse hash: SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
  const str = [
    PAYU_SALT,
    resp.status,
    '', '', '', '', '',
    resp.udf5 || '',
    resp.udf4 || '',
    resp.udf3 || '',
    resp.udf2 || '',
    resp.udf1 || '',
    resp.email,
    resp.firstname,
    resp.productinfo,
    resp.amount,
    resp.txnid,
    PAYU_KEY,
  ].join('|');
  const expected = crypto.createHash('sha512').update(str).digest('hex');
  return expected === resp.hash;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/payments/initiate
 * Creates a ServiceOrder in DB and returns PayU form params.
 *
 * Body: {
 *   patientName, patientEmail, patientPhone,
 *   items: [{ serviceId, pathwayId }]
 * }
 */
router.post('/initiate', async (req, res) => {
  const { patientName, patientEmail, patientPhone, items } = req.body;

  if (!patientName || !patientEmail || !patientPhone || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Missing required fields or empty cart.' });
  }

  // Validate and fetch pathways from DB
  const pathwayIds = items.map((i) => i.pathwayId);
  const pathways = await prisma.servicePathway.findMany({
    where: { id: { in: pathwayIds }, isActive: true },
    include: { service: true },
  });

  if (pathways.length !== items.length) {
    return res.status(400).json({ message: 'One or more selected pathways are invalid.' });
  }

  // Reject if any item has priceRs = 0 (e.g. Kitchen Cure)
  const freeItem = pathways.find((p) => p.priceRs === 0);
  if (freeItem) {
    return res.status(400).json({ message: `"${freeItem.service.title}" requires a consultation — please contact us.` });
  }

  const totalAmountRs = pathways.reduce((sum, p) => sum + p.priceRs, 0);
  const txnid = generateTxnId();

  // productinfo = comma-joined service titles (max 200 chars for PayU)
  const productinfo = pathways.map((p) => p.service.title).join(', ').slice(0, 200);

  // udf1 stores item mapping as JSON string for our reference
  const udf1 = JSON.stringify(items).slice(0, 255);

  const amount = (totalAmountRs).toFixed(2); // PayU wants string with 2 decimal places

  const hash = buildPayUHash({
    txnid, amount, productinfo,
    firstname: patientName.split(' ')[0],
    email: patientEmail,
    udf1,
  });

  // Save order to DB
  const order = await prisma.serviceOrder.create({
    data: {
      txnid,
      patientName,
      patientEmail,
      patientPhone,
      totalAmountRs,
      status: 'CREATED',
      items: {
        create: pathways.map((pw) => ({
          serviceId: pw.serviceId,
          pathwayId: pw.id,
          priceRs:   pw.priceRs,
        })),
      },
    },
  });

  logger.info('Payment initiated', { txnid, totalAmountRs, patientEmail });

  return res.json({
    payuUrl: PAYU_URL,
    params: {
      key:         PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname:   patientName.split(' ')[0],
      lastname:    patientName.split(' ').slice(1).join(' ') || '',
      email:       patientEmail,
      phone:       patientPhone,
      hash,
      udf1,
      surl: `${BACKEND_URL}/api/v1/payments/success`,
      furl: `${BACKEND_URL}/api/v1/payments/failure`,
    },
    orderId: order.id,
  });
});

/**
 * POST /api/v1/payments/success
 * PayU posts here on successful payment.
 */
router.post('/success', async (req, res) => {
  const body = req.body;
  logger.info('PayU success callback', { txnid: body.txnid, status: body.status });

  // Verify hash
  const hashValid = verifyPayUResponseHash({
    status:      body.status,
    udf1:        body.udf1 || '',
    udf2:        body.udf2 || '',
    udf3:        body.udf3 || '',
    udf4:        body.udf4 || '',
    udf5:        body.udf5 || '',
    email:       body.email,
    firstname:   body.firstname,
    productinfo: body.productinfo,
    amount:      body.amount,
    txnid:       body.txnid,
    hash:        body.hash,
  });

  if (!hashValid) {
    logger.error('PayU hash mismatch on success callback', { txnid: body.txnid });
    return res.redirect(`${FRONTEND_URL}/booking-failed?txnid=${body.txnid}&reason=hash_mismatch`);
  }

  // Update DB
  await prisma.serviceOrder.update({
    where:  { txnid: body.txnid },
    data: {
      status:      'PAID',
      payuStatus:  body.status,
      payuMihpayid: body.mihpayid,
      payuHash:    body.hash,
      payuResponse: body,
    },
  }).catch((e) => logger.error('DB update failed on success', { error: e.message }));

  // Send emails
  try {
    const order = await prisma.serviceOrder.findUnique({
      where: { txnid: body.txnid },
      include: { items: { include: { service: true, pathway: true } } },
    });
    if (order) await sendBookingConfirmation(order);
  } catch (e) {
    logger.error('Email send failed', { error: e.message });
  }

  return res.redirect(`${FRONTEND_URL}/booking-confirmed?txnid=${body.txnid}`);
});

/**
 * POST /api/v1/payments/failure
 * PayU posts here on failed payment.
 */
router.post('/failure', async (req, res) => {
  const body = req.body;
  logger.info('PayU failure callback', { txnid: body.txnid, status: body.status });

  await prisma.serviceOrder.update({
    where:  { txnid: body.txnid },
    data: {
      status:      'FAILED',
      payuStatus:  body.status,
      payuResponse: body,
    },
  }).catch((e) => logger.error('DB update failed on failure', { error: e.message }));

  return res.redirect(`${FRONTEND_URL}/booking-failed?txnid=${body.txnid}`);
});

/**
 * GET /api/v1/payments/order/:txnid
 * Public — get order status by txnid (used by confirmation page).
 */
router.get('/order/:txnid', async (req, res) => {
  const order = await prisma.serviceOrder.findUnique({
    where:   { txnid: req.params.txnid },
    include: { items: { include: { service: true, pathway: true } } },
  });
  if (!order) return res.status(404).json({ message: 'Order not found.' });

  // Only expose safe fields to public
  return res.json({
    txnid:         order.txnid,
    status:        order.status,
    patientName:   order.patientName,
    patientEmail:  order.patientEmail,
    totalAmountRs: order.totalAmountRs,
    createdAt:     order.createdAt,
    items: order.items.map((i) => ({
      serviceTitle: i.service.title,
      pathwayName:  i.pathway.name,
      duration:     i.pathway.duration,
      priceRs:      i.priceRs,
    })),
  });
});

/**
 * GET /api/v1/payments/admin/orders
 * Admin — paginated order list with items.
 */
router.get('/admin/orders', authGuard, roleGuard(Role.SUPERADMIN, Role.ADMIN), async (req, res) => {
  const page   = Math.max(Number(req.query.page  || 1), 1);
  const limit  = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const status = req.query.status;
  const skip   = (page - 1) * limit;

  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.serviceOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { items: { include: { service: true, pathway: true } } },
    }),
    prisma.serviceOrder.count({ where }),
  ]);

  return res.json({
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
});

/**
 * PATCH /api/v1/payments/admin/orders/:id
 * Admin — update order status.
 */
router.patch('/admin/orders/:id', authGuard, roleGuard(Role.SUPERADMIN, Role.ADMIN), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['CREATED', 'PAID', 'FAILED', 'PENDING', 'REFUNDED'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const updated = await prisma.serviceOrder.update({
    where: { id: req.params.id },
    data: { status },
    include: { items: { include: { service: true, pathway: true } } },
  });

  return res.json({ item: updated });
});

export default router;
