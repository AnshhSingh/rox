import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireRoles } from '../middleware';

const router = Router();

router.get('/metrics', requireAuth, requireRoles('ADMIN'), async (req: Request, res: Response) => {
  console.log('Admin metrics requested by:', (req as any).user);
  try {
    const [users, stores, ratings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);
    console.log('Metrics calculated:', { users, stores, ratings });
    res.json({ users, stores, ratings });
  } catch (error) {
    console.error('Error calculating metrics:', error);
    res.status(500).json({ message: 'Failed to calculate metrics' });
  }
});

export default router;
