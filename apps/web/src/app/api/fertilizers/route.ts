export async function GET() {
  return Response.json(
    { error: "Dünger-Katalog wird überarbeitet, vorübergehend nicht verfügbar." },
    { status: 503 }
  );
}
