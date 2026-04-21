import express from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../db.js';
import { authGuard, roleGuard } from '../middleware/auth.js';
import { audit } from '../utils/audit.js';

const router = express.Router();

// GET /api/v1/services — all active services with pathways
router.get('/', async (_req, res) => {
  const services = await prisma.service.findMany({
    where:   { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      pathways: {
        where:   { isActive: true },
        orderBy: { priceRs: 'asc' },
      },
    },
  });
  return res.json({ services });
});

// GET /api/v1/services/:id — single service
router.get('/:id', async (req, res) => {
  const service = await prisma.service.findUnique({
    where:   { id: req.params.id },
    include: {
      pathways: { where: { isActive: true }, orderBy: { priceRs: 'asc' } },
    },
  });
  if (!service || !service.isActive) {
    return res.status(404).json({ message: 'Service not found.' });
  }
  return res.json({ service });
});

// ─── Admin Routes ────────────────────────────────────────────────────────────

// GET /api/v1/services/admin — all services including inactive ones
router.get('/admin/all', authGuard, roleGuard(Role.SUPERADMIN, Role.ADMIN), async (_req, res) => {
  const services = await prisma.service.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      pathways: {
        orderBy: { priceRs: 'asc' },
      },
    },
  });
  return res.json({ services });
});

// PATCH /api/v1/services/admin/:id — update service details
router.patch('/admin/:id', authGuard, roleGuard(Role.SUPERADMIN, Role.ADMIN), async (req, res) => {
  const schema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    isPopular: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  const updated = await prisma.service.update({
    where: { id: req.params.id },
    data: parsed.data,
  });

  await audit(req.user.sub, 'service.update', 'Service', updated.id, parsed.data);
  return res.json({ service: updated });
});

// PATCH /api/v1/services/admin/pathway/:id — update pathway details (payments/pricing)
router.patch('/admin/pathway/:id', authGuard, roleGuard(Role.SUPERADMIN, Role.ADMIN), async (req, res) => {
  const schema = z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    duration: z.string().optional(),
    priceRs: z.number().int().min(0).optional(),
    totalDays: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload issues', issues: parsed.error.issues });
  }

  const updated = await prisma.servicePathway.update({
    where: { id: req.params.id },
    data: parsed.data,
  });

  await audit(req.user.sub, 'pathway.update', 'ServicePathway', updated.id, parsed.data);
  return res.json({ pathway: updated });
});

export default router;
