const { z } = require('zod');

// ── Reusable Password Validator ───────────────────────────────────────────────
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character'
  );

// ── Registration Schema ───────────────────────────────────────────────────────
const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: passwordSchema,
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  role: z
    .enum(['STUDENT', 'ADMIN', 'SUPER_ADMIN'])
    .optional()
    .default('STUDENT'),
});

// ── Login Schema ──────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ── Refresh Token Schema ──────────────────────────────────────────────────────
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ── Forgot Password Schema ────────────────────────────────────────────────────
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
};
