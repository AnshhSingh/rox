import { Router } from 'express';
import { prisma } from '../prisma';
import { createUserSchema, listQuerySchema } from '../validation';
import { requireAuth, requireRoles } from '../middleware';
import bcrypt from 'bcryptjs';

const router = Router();

// Admin create user (admin/user/owner)
router.post('/', requireAuth, requireRoles('ADMIN'), async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ message: 'Email already in use' });
  const hash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({ data: { ...parsed.data, password: hash } });
  res.status(201).json({ id: user.id });
});

// Admin list users with filters/sort/paginate
router.get('/', requireAuth, requireRoles('ADMIN'), async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { name, email, address, role, sortBy = 'createdAt', sortOrder = 'desc', page = 1, pageSize = 20 } = parsed.data;
  const where: any = {};
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (address) where.address = { contains: address, mode: 'insensitive' };
  if (role) where.role = role;
  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { [sortBy]: sortOrder }, skip: (page - 1) * pageSize, take: pageSize, select: { id: true, name: true, email: true, address: true, role: true } }),
    prisma.user.count({ where })
  ]);
  res.json({ items, total, page, pageSize });
});

// Admin get user details (with owner rating avg if OWNER)
router.get('/:id', requireAuth, requireRoles('ADMIN'), async (req, res) => {
  const id = req.params.id;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, address: true, role: true, stores: { select: { id: true } } } });
  if (!user) return res.status(404).json({ message: 'Not found' });
  let rating: number | null = null;
  if (user.role === 'OWNER') {
    const storeIds = user.stores.map((s: { id: string }) => s.id);
    if (storeIds.length) {
      const agg = await prisma.rating.aggregate({ where: { storeId: { in: storeIds } }, _avg: { value: true } });
      rating = agg._avg.value ?? null;
    }
  }
  res.json({ ...user, rating });
});

export default router;
