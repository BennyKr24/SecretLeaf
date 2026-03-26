// Privacy-first location handling: Use zones instead of exact coordinates

/**
 * Normalize location zone (e.g., "Berlin-Mitte" → "berlin-mitte")
 */
export const normalizeLocationZone = (zone: string): string => {
  return zone.trim().toLowerCase().replace(/\s+/g, "-");
};

/**
 * Get nearby zones (simple prefix matching for privacy)
 * This allows searching "berlin" to find "berlin-mitte", "berlin-kreuzberg", etc.
 */
export const getNearbyZones = (zonePrefix: string): string[] => {
  // In a real system, could use a precomputed zone hierarchy
  const prefix = normalizeLocationZone(zonePrefix);
  // For now, exact match
  return [prefix];
};
