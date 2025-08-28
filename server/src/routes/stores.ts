import { Router } from 'express';
import { prisma } from '../prisma';
import { createStoreSchema, listQuerySchema } from '../validation';
import { requireAuth, requireRoles, AuthedRequest, optionalAuth } from '../middleware';

const router = Router();

// Admin add store
router.post('/', requireAuth, requireRoles('ADMIN'), async (req, res) => {
  const parsed = createStoreSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const store = await prisma.store.create({ data: parsed.data });
  res.status(201).json({ id: store.id });
});

// Admin list stores with rating
router.get('/', optionalAuth, async (req: AuthedRequest, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { name, email, address, sortBy = 'name', sortOrder = 'asc', page = 1, pageSize = 20 } = parsed.data;
  const where: any = {};
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (address) where.address = { contains: address, mode: 'insensitive' };

  // Handle special sort cases
  let orderBy: any;
  if (sortBy === 'rating') {
    // Sort by average rating
    orderBy = {
      ratings: {
        _avg: {
          value: sortOrder
        }
      }
    };
  } else {
    // Normal field sorting
    orderBy = { [sortBy]: sortOrder };
  }

  const [items, total] = await Promise.all([
    prisma.store.findMany({ 
      where, 
      orderBy,
      skip: (page - 1) * pageSize, 
      take: pageSize,
      include: {
        ratings: {
          select: {
            value: true
          }
        }
      }
    }),
    prisma.store.count({ where })
  ]);
  const userId = req.user?.sub;
  const withAvg = await Promise.all(items.map(async (s: { id: string, ownerId: string | null }) => {
    const agg = await prisma.rating.aggregate({ where: { storeId: s.id }, _avg: { value: true } });
    let myRating: number | null = null;
    if (userId) {
      const r = await prisma.rating.findUnique({ where: { userId_storeId: { userId, storeId: s.id } } });
      myRating = r?.value ?? null;
    }
    return { 
      ...s,
      rating: agg._avg.value ?? null,
      myRating,
      isOwner: userId === s.ownerId
    } as any;
  }));
  res.json({ items: withAvg, total, page, pageSize });
});

// Owner dashboard list raters and average
router.get('/owner/my-store/ratings', requireAuth, requireRoles('OWNER'), async (req: AuthedRequest, res) => {
  const ownerId = req.user!.sub;
  const store = await prisma.store.findFirst({ where: { ownerId } });
  if (!store) return res.json({ store: null, raters: [], average: null });
  const ratings = await prisma.rating.findMany({ where: { storeId: store.id }, include: { user: { select: { id: true, name: true, email: true } } } });
  const average = ratings.length ? ratings.reduce((a: number, r: { value: number }) => a + r.value, 0) / ratings.length : null;
  res.json({
    store: {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address
    },
    raters: ratings.map((r: any) => ({ userId: r.userId, name: r.user.name, email: r.user.email, value: r.value })),
    average
  });
});

export default router;
