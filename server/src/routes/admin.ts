import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireRoles } from '../middleware';

const router = Router();

router.get('/metrics', requireAuth, requireRoles('ADMIN'), async (_req: Request, res: Response) => {
  const [users, stores, ratings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count(),
  ]);
  res.json({ users, stores, ratings });
});

export default router;
