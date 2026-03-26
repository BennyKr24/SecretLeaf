import { Prisma } from "@prisma/client";
import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { hashPassword, normalizeEmail, verifyPassword } from "../lib/security.js";

const registerSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_-]+$/, "Invalid username"),
  password: z.string().min(10).max(128),
  email: z.string().email().optional(),
  role: z.enum(["CONSUMER", "PROVIDER"]).default("CONSUMER")
});

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(1)
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/register",
    {
      config: {
        rateLimit: {
          max: 8,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      const parsed = registerSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
      }

      const payload = parsed.data;
      const passwordHash = await hashPassword(payload.password);
      // Prisma erwartet string|null (nicht undefined) für optionale Felder
      const emailValue: string | null = payload.email ? (normalizeEmail(payload.email) ?? null) : null;

      try {
        const userData = {
          username: payload.username,
          passwordHash,
          role: payload.role,
          email: emailValue
        } as const satisfies Parameters<typeof prisma.user.create>[0]["data"];

        const user = await prisma.user.create({ data: userData });

        const token = await reply.jwtSign(
          { sub: user.id, username: user.username, role: user.role as "CONSUMER" | "PROVIDER" },
          { expiresIn: app.config.ACCESS_TOKEN_TTL }
        );

        return reply.code(201).send({
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          }
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          return reply.code(409).send({ error: "Username or email already in use" });
        }
        request.log.error(error);
        return reply.code(500).send({ error: "Registration failed" });
      }
    }
  );

  app.post(
    "/login",
    {
      config: {
        rateLimit: {
          max: 12,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      const parsed = loginSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "Invalid input" });
      }

      const payload = parsed.data;

      const user = await prisma.user.findUnique({ where: { username: payload.username } });
      if (!user) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      const isValid = await verifyPassword(payload.password, user.passwordHash);
      if (!isValid) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      const token = await reply.jwtSign(
        { sub: user.id, username: user.username, role: user.role as "CONSUMER" | "PROVIDER" },
        { expiresIn: app.config.ACCESS_TOKEN_TTL }
      );

      return reply.send({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    }
  );
};
