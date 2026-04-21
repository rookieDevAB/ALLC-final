/* global process */
/**
 * customerAuth.js
 * Patient-facing authentication — completely separate from admin auth.
 * Routes:
 *   POST /api/v1/customer/register
 *   POST /api/v1/customer/login
 *   POST /api/v1/customer/logout
 *   POST /api/v1/customer/refresh
 *   GET  /api/v1/customer/me
 *   PATCH /api/v1/customer/me
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// ─── Config ──────────────────────────────────────────────────────────────────
const ACCESS_SECRET  = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TTL     = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_DAYS   = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
const IS_PROD        = process.env.NODE_ENV === 'production';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function signAccess(customerId, email) {
  return jwt.sign({ sub: customerId, email, role: 'CUSTOMER' }, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

function signRefresh() {
  return crypto.randomBytes(40).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function issueTokens(res, customer) {
  const accessToken  = signAccess(customer.id, customer.email);
  const refreshToken = signRefresh();
  const expiresAt    = new Date(Date.now() + REFRESH_DAYS * 86_400_000);

  await prisma.customerRefreshToken.create({
    data: {
      customerId: customer.id,
      tokenHash:  hashToken(refreshToken),
      expiresAt,
      userAgent:  res.req.headers['user-agent'] || null,
      ip:         res.req.ip || null,
    },
  });

  res.cookie('customerRefresh', refreshToken, {
    httpOnly: true,
    secure:   IS_PROD,
    sameSite: IS_PROD ? 'strict' : 'lax',
    maxAge:   REFRESH_DAYS * 86_400_000,
    path:     '/api/v1/customer',
  });

  return accessToken;
}

// ─── Auth middleware (customer only) ─────────────────────────────────────────

export function customerGuard(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(auth.slice(7), ACCESS_SECRET);
    if (payload.role !== 'CUSTOMER') return res.status(403).json({ message: 'Forbidden' });
    req.customer = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Token expired or invalid' });
  }
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name:     z.string().min(2).max(120),
  email:    z.string().email(),
  phone:    z.string().regex(/^[0-9]{10}$/, 'Must be 10 digits').optional(),
  password: z.string().min(8, 'At least 8 characters'),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/customer/register
 */
router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid data', issues: parsed.error.issues });
  }
  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: 'Email already registered. Please login.' });

  const passwordHash = await bcrypt.hash(password, 12);

  const customer = await prisma.customer.create({
    data: { name, email, phone: phone || null, passwordHash },
  });

  // Link any past orders placed with this email (before account creation)
  await prisma.serviceOrder.updateMany({
    where: { patientEmail: email, customerId: null, status: 'PAID' },
    data:  { customerId: customer.id },
  });

  const accessToken = await issueTokens(res, customer);

  logger.info('Customer registered', { customerId: customer.id, email });
  return res.status(201).json({
    accessToken,
    customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
  });
});

/**
 * POST /api/v1/customer/login
 */
router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Email and password required.' });

  const { email, password } = parsed.data;
  const customer = await prisma.customer.findUnique({ where: { email } });

  if (!customer || !customer.isActive) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });

  // Link any unlinked paid orders on login too
  await prisma.serviceOrder.updateMany({
    where: { patientEmail: email, customerId: null, status: 'PAID' },
    data:  { customerId: customer.id },
  });

  await prisma.customer.update({
    where: { id: customer.id },
    data:  { lastLoginAt: new Date() },
  });

  const accessToken = await issueTokens(res, customer);

  logger.info('Customer logged in', { customerId: customer.id, email });
  return res.json({
    accessToken,
    customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
  });
});

/**
 * POST /api/v1/customer/refresh
 */
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.customerRefresh;
  if (!token) return res.status(401).json({ message: 'No refresh token.' });

  const tokenHash = hashToken(token);
  const stored = await prisma.customerRefreshToken.findFirst({
    where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    include: { customer: true },
  });

  if (!stored || !stored.customer.isActive) {
    res.clearCookie('customerRefresh', { path: '/api/v1/customer' });
    return res.status(401).json({ message: 'Session expired. Please login again.' });
  }

  // Rotate refresh token
  await prisma.customerRefreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  const accessToken = await issueTokens(res, stored.customer);

  return res.json({ accessToken });
});

/**
 * POST /api/v1/customer/logout
 */
router.post('/logout', async (req, res) => {
  const token = req.cookies?.customerRefresh;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.customerRefreshToken.updateMany({
      where: { tokenHash },
      data:  { revokedAt: new Date() },
    }).catch(() => {});
  }
  res.clearCookie('customerRefresh', { path: '/api/v1/customer' });
  return res.json({ message: 'Logged out.' });
});

/**
 * GET /api/v1/customer/me
 */
router.get('/me', customerGuard, async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where:  { id: req.customer.sub },
    select: { id: true, name: true, email: true, phone: true, createdAt: true, lastLoginAt: true },
  });
  if (!customer) return res.status(404).json({ message: 'Account not found.' });
  return res.json({ customer });
});

/**
 * PATCH /api/v1/customer/me — update name / phone
 */
router.patch('/me', customerGuard, async (req, res) => {
  const schema = z.object({
    name:  z.string().min(2).max(120).optional(),
    phone: z.string().regex(/^[0-9]{10}$/).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid data', issues: parsed.error.issues });

  const customer = await prisma.customer.update({
    where:  { id: req.customer.sub },
    data:   parsed.data,
    select: { id: true, name: true, email: true, phone: true },
  });
  return res.json({ customer });
});

export default router;
