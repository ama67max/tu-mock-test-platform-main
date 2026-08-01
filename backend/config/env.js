const dotenv = require('dotenv');
const { z } = require('zod');

// Load .env file into process.env
dotenv.config();

const envSchema = z.object({
  // Server
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(65535))
    .default('5000'),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Database
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine((val) => val.startsWith('postgresql://'), {
      message: 'DATABASE_URL must be a valid PostgreSQL connection string',
    }),

  // Cache
  REDIS_URL: z
    .string()
    .min(1, 'REDIS_URL is required')
    .default('redis://localhost:6379'),

  // JWT
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),

  JWT_ACCESS_EXPIRY: z
    .string()
    .default('15m'),

  JWT_REFRESH_EXPIRY: z
    .string()
    .default('7d'),

  // Security
  BCRYPT_SALT_ROUNDS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(10).max(20))
    .default('12'),

  FRONTEND_URL: z
    .string()
    .url()
    .default('http://localhost:5173'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive())
    .default('900000'), // 15 minutes

  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive())
    .default('100'),

  // Logging
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('info'),
});

// Parse and validate; throws ZodError on failure (crashes app intentionally)
const parsed = envSchema.parse(process.env);

// Freeze to prevent runtime mutation
const config = Object.freeze({
  ...parsed,

  // Convenience booleans
  isDevelopment: parsed.NODE_ENV === 'development',
  isProduction: parsed.NODE_ENV === 'production',
  isTest: parsed.NODE_ENV === 'test',
});

module.exports = config;
