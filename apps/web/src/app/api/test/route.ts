export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ hello: "world", ts: new Date().toISOString() });
}
