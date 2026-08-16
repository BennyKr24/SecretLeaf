import { ImageResponse } from "next/og";
import { BrandIcon } from "@/lib/brand/leafMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// No pre-rounded corners here — iOS applies its own squircle mask to
// whatever square is provided for apple-touch-icon, so a pre-rounded
// square would just leave awkward flat corners inside iOS's own rounding.
export default function AppleIcon() {
  return new ImageResponse(<BrandIcon size={180} radius={0} />, size);
}
