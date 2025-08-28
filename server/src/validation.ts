import { z } from 'zod';

export const nameSchema = z.string().min(20, 'Name must be at least 20 characters').max(60, 'Name must be at most 60 characters');
export const addressSchema = z.string().max(400, 'Address must be at most 400 characters');
export const emailSchema = z.string().email('Invalid email');
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(16, 'Password must be at most 16 characters')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[!@#$%^&*(),.?":{}|<>_\-\[\]\\/]/, 'Password must include a special character');

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
  role: z.enum(['ADMIN', 'USER', 'OWNER'])
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const createStoreSchema = z.object({
  name: z.string().min(1).max(120),
  email: emailSchema,
  address: addressSchema,
  ownerId: z.string().optional(),
});

export const rateSchema = z.object({
  storeId: z.string().min(1),
  value: z.number().int().min(1).max(5),
});

export const listQuerySchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['ADMIN', 'USER', 'OWNER']).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});
