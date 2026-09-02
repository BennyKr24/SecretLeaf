import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { legal } from "./_legal";
import { footerText, type EmailLocale } from "./_strings";
import { bodyFontStack, color, fontStack, size } from "./_theme";

type Props = {
  locale: EmailLocale;
  preheader: string;
  /** Footer-Zeile "warum bekomme ich das", {email} bereits ersetzt. */
  reason: string;
  children: React.ReactNode;
};

// Dark-Mode: die Rollen bewusst umdrehen für Clients mit echtem
// prefers-color-scheme (Apple Mail, iOS, Outlook 2019+, Thunderbird).
// Inline-Styles = light-Default; die Klassen hier überschreiben mit !important.
const darkModeCss = `
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  @media (prefers-color-scheme: dark) {
    .email-body   { background-color: ${color.dark.canvas} !important; }
    .email-card   { background-color: ${color.dark.card} !important; border-color: ${color.dark.border} !important; }
    .email-text   { color: ${color.dark.text} !important; }
    .email-muted  { color: ${color.dark.textMuted} !important; }
    .email-hr     { border-color: ${color.dark.border} !important; }
    .email-link   { color: ${color.dark.primary} !important; }
    .email-stripe { background-color: ${color.dark.primary} !important; }
  }
  a { text-decoration: none; }
`;

export function BaseLayout({ locale, preheader, reason, children }: Props) {
  const f = footerText[locale];

  return (
    <Html lang={locale}>
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{darkModeCss}</style>
      </Head>
      <Preview>{preheader}</Preview>
      <Body
        className="email-body"
        style={{
          margin: 0,
          padding: "24px 0",
          backgroundColor: color.canvas,
          fontFamily: bodyFontStack,
        }}
      >
        <Container style={{ width: "100%", maxWidth: size.container, margin: "0 auto" }}>
          {/* ── Card ── */}
          <Section
            className="email-card"
            style={{
              backgroundColor: color.card,
              border: `1px solid ${color.border}`,
              borderRadius: size.radius,
              overflow: "hidden",
            }}
          >
            {/* Header: schmaler Marken-Streifen + Wordmark */}
            <Section style={{ padding: "0" }}>
              <table
                role="presentation"
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse" }}
              >
                <tbody>
                  <tr>
                    <td
                      className="email-stripe"
                      style={{ width: 4, backgroundColor: color.primary }}
                    >
                      &nbsp;
                    </td>
                    <td style={{ padding: "22px 28px" }}>
                      <Text
                        className="email-text"
                        style={{
                          margin: 0,
                          fontFamily: fontStack,
                          fontSize: 18,
                          fontWeight: 700,
                          letterSpacing: "-0.01em",
                          color: color.text,
                        }}
                      >
                        {legal.productName}
                      </Text>
                      <Text
                        className="email-muted"
                        style={{
                          margin: "2px 0 0",
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: color.textMuted,
                        }}
                      >
                        Grow Operating System
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Hr
              className="email-hr"
              style={{ margin: 0, borderColor: color.border, borderStyle: "solid", borderWidth: "0 0 1px" }}
            />

            {/* Inhalt (pro Template) */}
            <Section style={{ padding: "28px" }}>{children}</Section>
          </Section>

          {/* ── Footer (außerhalb der Card) ── */}
          <Section style={{ padding: "20px 28px 8px" }}>
            <Text
              className="email-muted"
              style={{ margin: 0, fontSize: 12, lineHeight: "1.7", color: color.textMuted }}
            >
              {legal.productName} · {legal.operator}
              <br />
              {legal.addressLines.join(" · ")}
              <br />
              <Link
                href={`mailto:${legal.contactEmail}`}
                className="email-link email-muted"
                style={{ color: color.textMuted }}
              >
                {legal.contactEmail}
              </Link>
              {legal.commercial && legal.vatId ? (
                <>
                  <br />
                  USt-IdNr.: {legal.vatId}
                </>
              ) : null}
              {legal.commercial && legal.register ? (
                <>
                  <br />
                  {legal.register}
                </>
              ) : null}
              {legal.commercial && legal.managingDirector ? (
                <>
                  <br />
                  {locale === "de" ? "Vertretungsberechtigt: " : "Represented by: "}
                  {legal.managingDirector}
                </>
              ) : null}
            </Text>

            <Text
              className="email-muted"
              style={{ margin: "10px 0 0", fontSize: 12, color: color.textMuted }}
            >
              <Link
                href={`${legal.siteUrl}/impressum`}
                className="email-link email-muted"
                style={{ color: color.textMuted }}
              >
                {f.imprint}
              </Link>
              {"  ·  "}
              <Link
                href={`${legal.siteUrl}/datenschutz`}
                className="email-link email-muted"
                style={{ color: color.textMuted }}
              >
                {f.privacy}
              </Link>
            </Text>

            <Text
              className="email-muted"
              style={{ margin: "12px 0 0", fontSize: 11, lineHeight: "1.6", color: color.textMuted }}
            >
              {reason}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
