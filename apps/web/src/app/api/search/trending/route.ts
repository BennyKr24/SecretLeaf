import { getTrendingTopics } from "@/lib/search/engine";

export const dynamic = "force-static";
export const revalidate = 3600; // 1h

export async function GET() {
  try {
    const topics = getTrendingTopics();
    return Response.json({ topics });
  } catch {
    return Response.json({ topics: [] });
  }
}
