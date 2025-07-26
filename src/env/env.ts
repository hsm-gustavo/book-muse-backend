import { z } from 'zod';

export const envSchema = z.object({
  REDIS_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().optional().default(3000),
  JWT_SECRET: z.string(),
  JWT_TOKEN_AUDIENCE: z.string().url(),
  JWT_TOKEN_ISSUER: z.string().url(),
  JWT_TTL: z.coerce.number().optional().default(3600),
  R2_ENDPOINT: z.string().url(),
  R2_REGION: z.string(),
  R2_ACCESS_KEY: z.string(),
  R2_SECRET_KEY: z.string(),
  R2_BUCKET: z.string(),
  R2_PUBLIC_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;
