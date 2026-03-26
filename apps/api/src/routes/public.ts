import { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";

type PriceTier = {
  qty: number;
  pricePerUnit: number;
};

type RiskLevel = "green" | "yellow" | "red";

type StatusEvent = {
  key: string;
  label: string;
  count: number;
  level: RiskLevel;
  description: string;
  lastSeen: string | null;
};

const extractCheapestPrice = (priceTiers: unknown): number | null => {
  if (!Array.isArray(priceTiers)) return null;

  const numericPrices = priceTiers
    .map((tier) => (tier as PriceTier).pricePerUnit)
    .filter((price): price is number => typeof price === "number" && Number.isFinite(price) && price > 0);

  if (numericPrices.length === 0) return null;
  return Math.min(...numericPrices);
};

const mapPublicListing = (listing: {
  id: string;
  title: string;
  description: string | null;
  locationZone: string;
  quantityAvailable: number;
  unit: string;
  updatedAt: Date;
  priceTiers: unknown;
  provider: { username: string };
}) => {
  const cheapestPrice = extractCheapestPrice(listing.priceTiers);
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    locationZone: listing.locationZone,
    quantityAvailable: listing.quantityAvailable,
    unit: listing.unit,
    provider: listing.provider.username,
    cheapestPrice,
    updatedAt: listing.updatedAt.toISOString()
  };
};

export const publicRoutes: FastifyPluginAsync = async (app) => {
  app.get("/overview", async () => {
    try {
      const [activeListings, providers, latestListings] = await Promise.all([
        prisma.listing.count({ where: { isActive: true } }),
        prisma.user.count({ where: { role: "PROVIDER" } }),
        prisma.listing.findMany({
          where: { isActive: true },
          include: {
            provider: {
              select: {
                username: true
              }
            }
          },
          orderBy: { updatedAt: "desc" },
          take: 6
        })
      ]);

      const featuredListings = latestListings
        .map((listing) => mapPublicListing(listing))
        .filter((listing) => listing.cheapestPrice !== null);

      return {
        generatedAt: new Date().toISOString(),
        degraded: false,
        stats: {
          activeListings,
          providers,
          privacyMode: "minimal-logging"
        },
        featuredListings
      };
    } catch {
      return {
        generatedAt: new Date().toISOString(),
        degraded: true,
        stats: {
          activeListings: 0,
          providers: 0,
          privacyMode: "minimal-logging"
        },
        featuredListings: []
      };
    }
  });

  app.get("/listings", async (request, reply) => {
    const { locationZone, minPrice, maxPrice, limit } = request.query as {
      locationZone?: string;
      minPrice?: string;
      maxPrice?: string;
      limit?: string;
    };

    const parsedLimit = Number(limit ?? "12");
    const safeLimit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 24) : 12;

    const parsedMinPrice = minPrice !== undefined ? Number(minPrice) : undefined;
    const parsedMaxPrice = maxPrice !== undefined ? Number(maxPrice) : undefined;

    if (parsedMinPrice !== undefined && (!Number.isFinite(parsedMinPrice) || parsedMinPrice < 0)) {
      return reply.code(400).send({ error: "Invalid minPrice" });
    }

    if (parsedMaxPrice !== undefined && (!Number.isFinite(parsedMaxPrice) || parsedMaxPrice < 0)) {
      return reply.code(400).send({ error: "Invalid maxPrice" });
    }

    if (parsedMinPrice !== undefined && parsedMaxPrice !== undefined && parsedMinPrice > parsedMaxPrice) {
      return reply.code(400).send({ error: "minPrice must be <= maxPrice" });
    }

    try {
      const listings = await prisma.listing.findMany({
        where: {
          isActive: true,
          ...(locationZone ? { locationZone } : {})
        },
        include: {
          provider: {
            select: {
              username: true
            }
          }
        },
        orderBy: { updatedAt: "desc" },
        take: safeLimit * 2
      });

      const filteredListings = listings
        .map((listing) => mapPublicListing(listing))
        .filter((listing) => listing.cheapestPrice !== null)
        .filter((listing) => (parsedMinPrice !== undefined ? (listing.cheapestPrice as number) >= parsedMinPrice : true))
        .filter((listing) => (parsedMaxPrice !== undefined ? (listing.cheapestPrice as number) <= parsedMaxPrice : true))
        .slice(0, safeLimit);

      return {
        degraded: false,
        total: filteredListings.length,
        filters: {
          locationZone: locationZone ?? null,
          minPrice: parsedMinPrice ?? null,
          maxPrice: parsedMaxPrice ?? null,
          limit: safeLimit
        },
        listings: filteredListings
      };
    } catch {
      return {
        degraded: true,
        total: 0,
        filters: {
          locationZone: locationZone ?? null,
          minPrice: parsedMinPrice ?? null,
          maxPrice: parsedMaxPrice ?? null,
          limit: safeLimit
        },
        listings: []
      };
    }
  });

  app.get("/status-report", async () => {
    const now = new Date();
    const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
      const [auditLogs, canReachDb] = await Promise.all([
        prisma.auditLog.findMany({
          where: {
            createdAt: {
              gte: since
            }
          },
          select: {
            action: true,
            createdAt: true
          }
        }),
        prisma.$queryRaw`SELECT 1`
      ]);

      const actionMap: Record<string, { label: string; description: string; thresholdYellow: number; thresholdRed: number }> = {
        LEGAL_REQUEST: {
          label: "Rechtliche Auskunftsanfragen",
          description: "Externe Anfragen zu Datenoffenlegung oder Herausgabe.",
          thresholdYellow: 1,
          thresholdRed: 3
        },
        ACCOUNT_TAKEOVER_ATTEMPT: {
          label: "Verdacht auf Kontoübernahmen",
          description: "Ungewöhnliche Login-Muster oder kompromittierte Zugriffe.",
          thresholdYellow: 2,
          thresholdRed: 5
        },
        DATA_EXPORT_BULK: {
          label: "Ungewöhnliche Datenexporte",
          description: "Überdurchschnittliche Exportanfragen in kurzer Zeit.",
          thresholdYellow: 2,
          thresholdRed: 4
        },
        RATE_LIMIT_SPIKE: {
          label: "Traffic-/Rate-Limit-Spitzen",
          description: "Auffällige Lastspitzen, die auf Missbrauch hindeuten können.",
          thresholdYellow: 5,
          thresholdRed: 15
        },
        INCIDENT_RESPONSE: {
          label: "Sicherheitsvorfälle",
          description: "Bestätigte sicherheitsrelevante Vorfälle mit Response-Prozess.",
          thresholdYellow: 1,
          thresholdRed: 2
        }
      };

      const events: StatusEvent[] = Object.entries(actionMap).map(([action, cfg]) => {
        const matching = auditLogs.filter((entry) => entry.action === action);
        const count = matching.length;
        const latest = matching.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

        let level: RiskLevel = "green";
        if (count >= cfg.thresholdRed) {
          level = "red";
        } else if (count >= cfg.thresholdYellow) {
          level = "yellow";
        }

        return {
          key: action,
          label: cfg.label,
          count,
          level,
          description: cfg.description,
          lastSeen: latest ? latest.createdAt.toISOString() : null
        };
      });

      const hasRed = events.some((event) => event.level === "red");
      const hasYellow = events.some((event) => event.level === "yellow");

      return {
        generatedAt: now.toISOString(),
        windowDays: 30,
        degraded: false,
        overallStatus: hasRed ? "red" : hasYellow ? "yellow" : "green",
        services: {
          api: "green",
          db: canReachDb ? "green" : "red"
        },
        events
      };
    } catch {
      const fallbackEvents: StatusEvent[] = [
        {
          key: "SYSTEM_DEGRADED",
          label: "Eingeschränkte Sicht auf Sicherheitslage",
          count: 1,
          level: "yellow",
          description: "Der Statusreport läuft im Fallback-Modus. Detaildaten sind temporär eingeschränkt.",
          lastSeen: now.toISOString()
        }
      ];

      return {
        generatedAt: now.toISOString(),
        windowDays: 30,
        degraded: true,
        overallStatus: "yellow",
        services: {
          api: "green",
          db: "red"
        },
        events: fallbackEvents
      };
    }
  });
};
