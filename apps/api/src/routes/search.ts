import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const searchQuerySchema = z.object({
  locationZone: z.string(),
  minQuantity: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional()
});

export const searchRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  // Search offers
  app.get("/offers", async (request, reply) => {
    const parsed = searchQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid filters", details: parsed.error.flatten().fieldErrors });
    }

    const { locationZone, minQuantity, minPrice, maxPrice } = parsed.data;

    const whereClause = {
      isActive: true,
      locationZone: locationZone,
      ...(minQuantity ? { quantityAvailable: { gte: minQuantity } } : {})
    };

    const listings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        provider: { select: { username: true } }
      },
      orderBy: { updatedAt: "desc" },
      take: 100
    });

    // Filter by price from priceTiers JSON
    const offers = listings
      .map((listing) => {
        const priceTiers = listing.priceTiers as Array<{ qty: number; pricePerUnit: number }>;
        const cheapest = Math.min(...priceTiers.map((tier) => tier.pricePerUnit));

        return {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          quantityAvailable: listing.quantityAvailable,
          unit: listing.unit,
          provider: listing.provider.username,
          priceTiers: priceTiers,
          cheapestPrice: cheapest,
          locationZone: listing.locationZone
        };
      })
      .filter((offer) => (minPrice ? offer.cheapestPrice >= minPrice : true))
      .filter((offer) => (maxPrice ? offer.cheapestPrice <= maxPrice : true))
      .sort((a, b) => a.cheapestPrice - b.cheapestPrice);

    return reply.send({ offers, total: offers.length });
  });
};
