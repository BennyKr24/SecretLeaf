import { getTrendingTopics } from "@/lib/search/engine";

export const dynamic = "force-static";
export const revalidate = 3600; // 1h

export async function GET() {
  const topics = getTrendingTopics();
  return Response.json({ topics });
}
