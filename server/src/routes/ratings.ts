import { Router } from 'express';
import { prisma } from '../prisma';
import { rateSchema } from '../validation';
import { requireAuth, AuthedRequest, requireRoles } from '../middleware';

const router = Router();

// List ratings for a store (public for listing store details)
router.get('/store/:storeId', async (req, res) => {
  const storeId = req.params.storeId;
  const ratings = await prisma.rating.findMany({ where: { storeId }, select: { value: true } });
  const average = ratings.length ? ratings.reduce((a: number, r: { value: number }) => a + r.value, 0) / ratings.length : null;
  res.json({ count: ratings.length, average });
});

// Get my rating for a store
router.get('/me/:storeId', requireAuth, async (req: AuthedRequest, res) => {
  const storeId = req.params.storeId;
  const userId = req.user!.sub;
  const rating = await prisma.rating.findUnique({ where: { userId_storeId: { userId, storeId } } });
  res.json({ value: rating?.value ?? null });
});

// Create or update rating
router.post('/', requireAuth, requireRoles('USER'), async (req: AuthedRequest, res) => {
  const parsed = rateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { storeId, value } = parsed.data;
  const userId = req.user!.sub;
  const upsert = await prisma.rating.upsert({
    where: { userId_storeId: { userId, storeId } },
    update: { value },
    create: { userId, storeId, value },
  });
  res.json({ value: upsert.value });
});

export default router;
