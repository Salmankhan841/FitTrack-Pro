import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const settingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  age: z.coerce.number().min(13, 'Must be at least 13').max(120, 'Invalid age').optional().or(z.literal('')),
  weight: z.coerce.number().min(20, 'Invalid weight').max(500, 'Invalid weight').optional().or(z.literal('')),
  height: z.coerce.number().min(50, 'Invalid height').max(300, 'Invalid height').optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Non-Binary', 'Prefer not to say', '']).optional(),
});
