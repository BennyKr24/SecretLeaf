import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "../../.env" });

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().default("file:./dev.db"),
  JWT_SECRET: z.string().min(24, "JWT_SECRET must be at least 24 characters"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  console.error(
    "Hint: copy apps/api/.env.example to apps/api/.env and set JWT_SECRET (>=24 chars), e.g. `openssl rand -base64 32`"
  );
  process.exit(1);
}

export const env = parsed.data;

const configuredOrigins = env.CORS_ORIGIN
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const githubPreviewOriginPattern = /^https:\/\/[a-z0-9-]+-\d+\.app\.github\.dev$/i;

export const isCorsOriginAllowed = (origin?: string) => {
  if (!origin) return true;

  try {
    const normalizedOrigin = new URL(origin).origin;

    if (configuredOrigins.includes(normalizedOrigin)) {
      return true;
    }

    return (
      localhostOriginPattern.test(normalizedOrigin) ||
      githubPreviewOriginPattern.test(normalizedOrigin)
    );
  } catch {
    return false;
  }
};
