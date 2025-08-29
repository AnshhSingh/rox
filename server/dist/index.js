// src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// src/routes/auth.ts
import { Router } from "express";

// src/prisma.ts
import { PrismaClient } from "@prisma/client";
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prisma || new PrismaClient({
  log: ["error", "warn"]
});
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// src/validation.ts
import { z } from "zod";
var nameSchema = z.string().min(20, "Name must be at least 20 characters").max(60, "Name must be at most 60 characters");
var addressSchema = z.string().max(400, "Address must be at most 400 characters");
var emailSchema = z.string().email("Invalid email");
var passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(16, "Password must be at most 16 characters").regex(/[A-Z]/, "Password must include an uppercase letter").regex(/[!@#$%^&*(),.?":{}|<>_\-\[\]\\/]/, "Password must include a special character");
var signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema
});
var loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});
var createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
  role: z.enum(["ADMIN", "USER", "OWNER"])
});
var changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: passwordSchema
});
var createStoreSchema = z.object({
  name: z.string().min(1).max(120),
  email: emailSchema,
  address: addressSchema,
  ownerId: z.string().optional()
});
var rateSchema = z.object({
  storeId: z.string().min(1),
  value: z.number().int().min(1).max(5)
});
var listQuerySchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["ADMIN", "USER", "OWNER"]).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional()
});

// src/routes/auth.ts
import bcrypt from "bcryptjs";
import jwt2 from "jsonwebtoken";

// src/middleware/index.ts
import jwt from "jsonwebtoken";
var requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : void 0;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const secret = process.env.JWT_SECRET || "";
    if (!secret) return res.status(500).json({ message: "Server misconfigured" });
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
var requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};
var optionalAuth = (req, _res, next) => {
  const header = req.headers?.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : void 0;
  if (!token) return next();
  try {
    const secret = process.env.JWT_SECRET || "";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
  } catch {
  }
  next();
};

// src/routes/auth.ts
var router = Router();
router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { name, email, address, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "Email already in use" });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, address, password: hash, role: "USER" } });
  return res.status(201).json({ id: user.id });
});
router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt2.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email } });
});
router.post("/change-password", requireAuth, async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const userId = req.user.sub;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: "User not found" });
  const ok = await bcrypt.compare(parsed.data.oldPassword, user.password);
  if (!ok) return res.status(400).json({ message: "Old password incorrect" });
  const hash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hash } });
  res.json({ success: true });
});
var auth_default = router;

// src/routes/users.ts
import { Router as Router2 } from "express";
import bcrypt2 from "bcryptjs";
var router2 = Router2();
router2.post("/", requireAuth, requireRoles("ADMIN"), async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ message: "Email already in use" });
  const hash = await bcrypt2.hash(parsed.data.password, 10);
  const user = await prisma.user.create({ data: { ...parsed.data, password: hash } });
  res.status(201).json({ id: user.id });
});
router2.get("/", requireAuth, requireRoles("ADMIN"), async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { name, email, address, role, sortBy = "createdAt", sortOrder = "desc", page = 1, pageSize = 20 } = parsed.data;
  const where = {};
  if (name) where.name = { contains: name, mode: "insensitive" };
  if (email) where.email = { contains: email, mode: "insensitive" };
  if (address) where.address = { contains: address, mode: "insensitive" };
  if (role) where.role = role;
  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { [sortBy]: sortOrder }, skip: (page - 1) * pageSize, take: pageSize, select: { id: true, name: true, email: true, address: true, role: true } }),
    prisma.user.count({ where })
  ]);
  res.json({ items, total, page, pageSize });
});
router2.get("/:id", requireAuth, requireRoles("ADMIN"), async (req, res) => {
  const id = req.params.id;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, address: true, role: true, stores: { select: { id: true } } } });
  if (!user) return res.status(404).json({ message: "Not found" });
  let rating = null;
  if (user.role === "OWNER") {
    const storeIds = user.stores.map((s) => s.id);
    if (storeIds.length) {
      const agg = await prisma.rating.aggregate({ where: { storeId: { in: storeIds } }, _avg: { value: true } });
      rating = agg._avg.value ?? null;
    }
  }
  res.json({ ...user, rating });
});
var users_default = router2;

// src/routes/stores.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.post("/", requireAuth, requireRoles("ADMIN"), async (req, res) => {
  const parsed = createStoreSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const store = await prisma.store.create({ data: parsed.data });
  res.status(201).json({ id: store.id });
});
router3.get("/", optionalAuth, async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { name, email, address, sortBy = "name", sortOrder = "asc", page = 1, pageSize = 20 } = parsed.data;
  const where = {};
  if (name) where.name = { contains: name, mode: "insensitive" };
  if (email) where.email = { contains: email, mode: "insensitive" };
  if (address) where.address = { contains: address, mode: "insensitive" };
  let orderBy;
  if (sortBy === "rating") {
    orderBy = {
      ratings: {
        _avg: {
          value: sortOrder
        }
      }
    };
  } else {
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
  const withAvg = await Promise.all(items.map(async (s) => {
    const agg = await prisma.rating.aggregate({ where: { storeId: s.id }, _avg: { value: true } });
    let myRating = null;
    if (userId) {
      const r = await prisma.rating.findUnique({ where: { userId_storeId: { userId, storeId: s.id } } });
      myRating = r?.value ?? null;
    }
    return {
      ...s,
      rating: agg._avg.value ?? null,
      myRating,
      isOwner: userId === s.ownerId
    };
  }));
  res.json({ items: withAvg, total, page, pageSize });
});
router3.get("/owner/my-store/ratings", requireAuth, requireRoles("OWNER"), async (req, res) => {
  const ownerId = req.user.sub;
  const store = await prisma.store.findFirst({ where: { ownerId } });
  if (!store) return res.json({ store: null, raters: [], average: null });
  const ratings = await prisma.rating.findMany({ where: { storeId: store.id }, include: { user: { select: { id: true, name: true, email: true } } } });
  const average = ratings.length ? ratings.reduce((a, r) => a + r.value, 0) / ratings.length : null;
  res.json({
    store: {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address
    },
    raters: ratings.map((r) => ({ userId: r.userId, name: r.user.name, email: r.user.email, value: r.value })),
    average
  });
});
var stores_default = router3;

// src/routes/ratings.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.get("/store/:storeId", async (req, res) => {
  const storeId = req.params.storeId;
  const ratings = await prisma.rating.findMany({ where: { storeId }, select: { value: true } });
  const average = ratings.length ? ratings.reduce((a, r) => a + r.value, 0) / ratings.length : null;
  res.json({ count: ratings.length, average });
});
router4.get("/me/:storeId", requireAuth, async (req, res) => {
  const storeId = req.params.storeId;
  const userId = req.user.sub;
  const rating = await prisma.rating.findUnique({ where: { userId_storeId: { userId, storeId } } });
  res.json({ value: rating?.value ?? null });
});
router4.post("/", requireAuth, requireRoles("USER"), async (req, res) => {
  const parsed = rateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { storeId, value } = parsed.data;
  const userId = req.user.sub;
  const upsert = await prisma.rating.upsert({
    where: { userId_storeId: { userId, storeId } },
    update: { value },
    create: { userId, storeId, value }
  });
  res.json({ value: upsert.value });
});
var ratings_default = router4;

// src/routes/admin.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.get("/metrics", requireAuth, requireRoles("ADMIN"), async (_req, res) => {
  const [users, stores, ratings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count()
  ]);
  res.json({ users, stores, ratings });
});
var admin_default = router5;

// src/index.ts
import bcrypt3 from "bcryptjs";
var app = express();
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(morgan("dev"));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", auth_default);
app.use("/api/users", users_default);
app.use("/api/stores", stores_default);
app.use("/api/ratings", ratings_default);
app.use("/api/admin", admin_default);
async function bootstrap() {
  const count = await prisma.user.count();
  if (count === 0) {
    const name = process.env.BOOTSTRAP_ADMIN_NAME;
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    const address = process.env.BOOTSTRAP_ADMIN_ADDRESS || "N/A";
    if (name && email && password) {
      const hash = await bcrypt3.hash(password, 10);
      await prisma.user.create({ data: { name, email, address, password: hash, role: "ADMIN" } });
      console.log("Created bootstrap admin:", email);
    } else {
      console.warn("No users found. Set BOOTSTRAP_ADMIN_* env vars to create an initial admin.");
    }
  }
}
var port = Number(process.env.PORT || 4e3);
bootstrap().finally(() => {
  app.listen(port, () => console.log(`server listening on http://localhost:${port}`));
});
export {
  prisma
};
