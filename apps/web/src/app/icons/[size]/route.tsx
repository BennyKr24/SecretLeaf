import { ImageResponse } from "next/og";
import { BrandIcon } from "@/lib/brand/leafMark";

const SPECS: Record<string, { px: number; maskable: boolean }> = {
  "192": { px: 192, maskable: false },
  "512": { px: 512, maskable: false },
  "192-maskable": { px: 192, maskable: true },
  "512-maskable": { px: 512, maskable: true },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params;
  const spec = SPECS[size];
  if (!spec) {
    return new Response("Not found", { status: 404 });
  }

  // Maskable icons must be full-bleed/opaque with the glyph kept inside
  // the ~80%-diameter "safe zone" circle (W3C manifest spec) so Android's
  // adaptive-icon mask never clips it — hence no radius and a smaller
  // glyphScale than the plain "any"-purpose icons below.
  return new ImageResponse(
    spec.maskable ? (
      <BrandIcon size={spec.px} radius={0} glyphScale={0.4} />
    ) : (
      <BrandIcon size={spec.px} radius={Math.round(spec.px * 0.22)} glyphScale={0.58} />
    ),
    { width: spec.px, height: spec.px }
  );
}
