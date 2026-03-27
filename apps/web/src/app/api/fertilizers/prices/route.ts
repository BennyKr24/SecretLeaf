import { fertilizerPriceSnapshot } from "@/data/terpira/fertilizerPrices";

export async function GET() {
  return Response.json(fertilizerPriceSnapshot);
}
