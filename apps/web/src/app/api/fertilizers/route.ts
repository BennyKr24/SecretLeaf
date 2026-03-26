import { fertilizerCatalog, FertilizerPhase, FertilizerBase } from "@/data/terpira/fertilizers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const phase = searchParams.get('phase') as FertilizerPhase | null;
  const base = searchParams.get('base') as FertilizerBase | null;
  const cost = searchParams.get('cost') as 'budget' | 'mid' | 'premium' | null;
  const search = searchParams.get('search');

  let filtered = fertilizerCatalog;

  // Phase filter
  if (phase) {
    filtered = filtered.filter(f => f.phase.includes(phase));
  }

  // Base filter
  if (base) {
    filtered = filtered.filter(f => f.base === base);
  }

  // Cost filter
  if (cost) {
    filtered = filtered.filter(f => f.cost === cost);
  }

  // Search filter
  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter(f =>
      f.name.toLowerCase().includes(lower) ||
      f.brand.toLowerCase().includes(lower) ||
      f.id.toLowerCase().includes(lower) ||
      f.tags.some(t => t.toLowerCase().includes(lower))
    );
  }

  return Response.json({
    total: filtered.length,
    filters: {
      phase: phase || null,
      base: base || null,
      cost: cost || null,
      search: search || null
    },
    fertilizers: filtered
  });
}
