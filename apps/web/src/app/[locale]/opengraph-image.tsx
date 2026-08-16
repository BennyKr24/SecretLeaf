import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { BrandIcon } from "@/lib/brand/leafMark";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The card shown when a SecretLeaf link is shared/pasted — Discord,
// WhatsApp, Slack, iMessage, Twitter/X all read this via og:image. Locale-
// aware: reuses the same headline/tagline strings as the homepage hero
// and footer, so this never drifts from the on-site copy.
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const home = await getTranslations({ locale, namespace: "home" });
  const footer = await getTranslations({ locale, namespace: "footer" });
  const headlineLines = home("heroHeadline").split("\n");

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0c1712 0%, #070f0b 55%, #0f3226 100%)",
        }}
      >
        {/* decorative watermark */}
        <div
          style={{
            position: "absolute",
            right: -90,
            bottom: -90,
            display: "flex",
            opacity: 0.08,
          }}
        >
          <BrandIcon size={520} radius={0} />
        </div>

        {/* wordmark row */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <BrandIcon size={56} radius={14} />
          <div
            style={{
              display: "flex",
              marginLeft: 18,
              fontSize: 32,
              fontWeight: 700,
              color: "#f3f6f2",
              letterSpacing: -0.5,
            }}
          >
            SecretLeaf
          </div>
        </div>

        {/* headline + tagline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {headlineLines.map((line) => (
            <div
              key={line}
              style={{
                display: "flex",
                fontSize: 68,
                fontWeight: 700,
                color: "#f3f6f2",
                lineHeight: 1.08,
                letterSpacing: -1,
              }}
            >
              {line}
            </div>
          ))}
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 28,
              fontWeight: 500,
              color: "#8fa396",
            }}
          >
            {footer("tagline")}
          </div>
        </div>
      </div>
    ),
    size
  );
}
