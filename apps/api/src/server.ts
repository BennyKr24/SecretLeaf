import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { env, isCorsOriginAllowed } from "./config.js";
import { prisma } from "./lib/prisma.js";
import { authRoutes } from "./routes/auth.js";
import { listingRoutes } from "./routes/listings.js";
import { publicRoutes } from "./routes/public.js";
import { searchRoutes } from "./routes/search.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) => Promise<void>;
    config: typeof env;
  }
}

const app = Fastify({
  logger: {
    level: "warn",
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie", "res.headers['set-cookie']"],
      censor: "[REDACTED]"
    }
  },
  disableRequestLogging: true,
  trustProxy: true
});

app.decorate("config", env);

await app.register(helmet, {
  global: true,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: "same-site" },
  hsts:
    env.NODE_ENV === "production"
      ? {
          maxAge: 15552000,
          includeSubDomains: true,
          preload: true
        }
      : false
});

await app.register(cors, {
  origin: (origin, callback) => {
    callback(null, isCorsOriginAllowed(origin));
  },
  credentials: false,
  methods: ["GET", "POST", "PATCH"]
});

await app.register(rateLimit, {
  max: 120,
  timeWindow: "1 minute",
  ban: 2
});

await app.register(jwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: env.ACCESS_TOKEN_TTL
  }
});

app.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({ error: "Unauthorized" });
  }
});

app.get("/", async () => ({ name: "SecretLeaf API", version: "1.0.0", status: "ok" }));
app.get("/health", async (_request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok", privacyMode: "minimal-logging", services: { db: "green" } };
  } catch {
    return reply.code(503).send({
      status: "degraded",
      privacyMode: "minimal-logging",
      services: { db: "red" }
    });
  }
});
app.register(authRoutes, { prefix: "/auth" });
app.register(listingRoutes, { prefix: "/listings" });
app.register(publicRoutes, { prefix: "/public" });
app.register(searchRoutes, { prefix: "/search" });

const closeSignals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
closeSignals.forEach((signal) => {
  process.on(signal, async () => {
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  });
});

app
  .listen({ host: env.HOST, port: env.PORT })
  .then(() => {
    app.log.warn(`API listening on ${env.HOST}:${env.PORT}`);
  })
  .catch(async (error) => {
    app.log.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
