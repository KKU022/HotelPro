import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from current working directory or relative to src/config
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('5000')
    .transform((val) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed <= 0 || parsed > 65535) {
        throw new Error(`PORT must be a valid port number between 1 and 65535. Received: ${val}`);
      }
      return parsed;
    }),
  MONGO_URI: z
    .string()
    .default('')
    .describe('MongoDB connection string. Required in Phase 2 for database initialization.'),
  JWT_SECRET: z
    .string({
      required_error: 'JWT_SECRET is required.',
    })
    .min(16, 'JWT_SECRET must be at least 16 characters long for security.'),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173,http://127.0.0.1:5173')
    .transform((val) =>
      val
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)
    )
    .refine((origins) => origins.length > 0, {
      message: 'CORS_ORIGIN must contain at least one valid origin URL.',
    }),
  ADMIN_PASSWORD: z.string().optional().describe('Password used by the seed script to provision the admin user.'),
  GOOGLE_CLIENT_ID: z.string().optional().describe('Google OAuth Client ID for optional Google Identity sign-in'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Environment validation failed:');
  parsedEnv.error.errors.forEach((err) => {
    console.error(`  - ${err.path.join('.')}: ${err.message}`);
  });
  process.exit(1);
}

export const env = parsedEnv.data;
