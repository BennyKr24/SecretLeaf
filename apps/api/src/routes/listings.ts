import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const priceTierSchema = z.object({
  qty: z.number().int().positive(),
  pricePerUnit: z.number().positive()
});

const createListingSchema = z.object({
  title: z.string().min(3).max(128),
  description: z.string().max(500).optional(),
  quantityAvailable: z.number().int().positive(),
  unit: z.string().max(32).default("Stück"),
  priceTiers: z.array(priceTierSchema).min(1).max(8),
  locationZone: z.string().max(64) // e.g. "berlin-mitte"
});

const updateListingSchema = z.object({
  title: z.string().min(3).max(128).optional(),
  description: z.string().max(500).optional(),
  quantityAvailable: z.number().int().positive().optional(),
  priceTiers: z.array(priceTierSchema).optional(),
  isActive: z.boolean().optional()
});

export const listingRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  // Get user's listings
  app.get("/mine", async (request) => {
    const userId = (request.user as any).sub;

    const listings = await prisma.listing.findMany({
      where: { providerId: userId },
      orderBy: { updatedAt: "desc" }
    });
    return listings.map((l: (typeof listings)[number]) => ({ ...l, priceTiers: JSON.parse(l.priceTiers) }));
  });

  // Create listing
  app.post("/", async (request, reply) => {
    const parsed = createListingSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid input", details: parsed.error.flatten().fieldErrors });
    }

    const role = (request.user as any).role;
    if (role !== "PROVIDER") {
      return reply.code(403).send({ error: "Provider role required" });
    }

    const payload = parsed.data;

    const listing = await prisma.listing.create({
      data: {
        providerId: (request.user as any).sub,
        title: payload.title,
        description: payload.description ?? null,
        quantityAvailable: payload.quantityAvailable,
        unit: payload.unit,
        priceTiers: JSON.stringify(payload.priceTiers),
        locationZone: payload.locationZone,
        isActive: true
      }
    });

    return reply.code(201).send({ ...listing, priceTiers: JSON.parse(listing.priceTiers) });
  });

  // Update listing
  app.patch("/:listingId", async (request, reply) => {
    const { listingId } = request.params as { listingId: string };
    const parsed = updateListingSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid input" });
    }

    const userId = (request.user as any).sub;
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });

    if (!listing || listing.providerId !== userId) {
      return reply.code(404).send({ error: "Listing not found" });
    }

    const payload = parsed.data;
    const updateData: {
      title?: string;
      description?: string;
      quantityAvailable?: number;
      priceTiers?: string;
      isActive?: boolean;
    } = {};

    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.quantityAvailable !== undefined) updateData.quantityAvailable = payload.quantityAvailable;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;
    if (payload.priceTiers !== undefined) {
      updateData.priceTiers = JSON.stringify(payload.priceTiers);
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: updateData
    });

    return reply.send({ ...updated, priceTiers: JSON.parse(updated.priceTiers) });
  });

  // Delete listing
  app.delete("/:listingId", async (request, reply) => {
    const { listingId } = request.params as { listingId: string };
    const userId = (request.user as any).sub;

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.providerId !== userId) {
      return reply.code(404).send({ error: "Listing not found" });
    }

    await prisma.listing.delete({ where: { id: listingId } });
    return reply.code(204).send();
  });
};
