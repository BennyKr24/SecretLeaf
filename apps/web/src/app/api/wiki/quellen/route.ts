import { sourceRegister } from "@/data/terpira/wiki";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    sources: sourceRegister,
    total: sourceRegister.length,
    autoCount: sourceRegister.filter((s) => s.sourceType === "auto").length,
  });
}
