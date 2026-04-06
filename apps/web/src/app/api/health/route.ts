import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("studies").select("id", { count: "exact", head: true });

    if (error) {
      return Response.json(
        { status: "degraded", privacyMode: "minimal-logging", services: { db: "red" } },
        { status: 503 }
      );
    }

    return Response.json({ status: "ok", privacyMode: "minimal-logging", services: { db: "green" } });
  } catch {
    return Response.json(
      { status: "degraded", privacyMode: "minimal-logging", services: { db: "red" } },
      { status: 503 }
    );
  }
}
