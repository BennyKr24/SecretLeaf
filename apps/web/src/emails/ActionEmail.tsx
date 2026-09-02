import * as React from "react";
import { Button, Link, Section, Text } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";
import { strings, type EmailLocale } from "./_strings";
import { color, fontStack } from "./_theme";

export type ActionTemplateKey =
  | "confirmSignup"
  | "resetPassword"
  | "changeEmail"
  | "magicLink";

type Props = {
  templateKey: ActionTemplateKey;
  locale: EmailLocale;
  /** Vollständige Bestätigungs-/Reset-URL (aus dem Hook gebaut). */
  actionUrl: string;
  /** Empfänger-Adresse, für die Footer-Transparenzzeile. */
  recipientEmail: string;
};

/**
 * Gemeinsames Muster aller Auth-Mails: Überschrift, 1–2 Absätze, ein
 * bulletproof CTA-Button, roher Fallback-Link, Sicherheits-/Ablaufhinweis.
 */
export function ActionEmail({ templateKey, locale, actionUrl, recipientEmail }: Props) {
  const c = strings[templateKey][locale];

  return (
    <BaseLayout
      locale={locale}
      preheader={c.preheader}
      reason={c.reason.replace("{email}", recipientEmail)}
    >
      <Text
        className="email-text"
        style={{
          margin: "0 0 14px",
          fontFamily: fontStack,
          fontSize: 22,
          lineHeight: "1.3",
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: color.text,
        }}
      >
        {c.heading}
      </Text>

      {c.intro.map((p, i) => (
        <Text
          key={i}
          className="email-text"
          style={{
            margin: "0 0 16px",
            fontSize: 15,
            lineHeight: "1.6",
            color: color.text,
          }}
        >
          {p}
        </Text>
      ))}

      {/* Bulletproof CTA — Button-Component setzt die MSO-Padding-Fallbacks. */}
      <Section style={{ margin: "8px 0 20px" }}>
        <Button
          href={actionUrl}
          style={{
            backgroundColor: color.primary,
            color: color.primaryText,
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
            borderRadius: 10,
            padding: "14px 30px",
            display: "inline-block",
          }}
        >
          {c.cta}
        </Button>
      </Section>

      <Text
        className="email-muted"
        style={{ margin: "0 0 6px", fontSize: 12, lineHeight: "1.6", color: color.textMuted }}
      >
        {c.fallbackIntro}
      </Text>
      <Text style={{ margin: "0 0 20px", fontSize: 12, lineHeight: "1.5", wordBreak: "break-all" }}>
        <Link href={actionUrl} className="email-link" style={{ color: color.primary }}>
          {actionUrl}
        </Link>
      </Text>

      <Text
        className="email-muted"
        style={{ margin: 0, fontSize: 12, lineHeight: "1.6", color: color.textMuted }}
      >
        {c.securityNote}
      </Text>
    </BaseLayout>
  );
}

/** Preview-Defaults für den `react-email` Dev-Server. */
export function makePreview(templateKey: ActionTemplateKey) {
  const Preview = () => (
    <ActionEmail
      templateKey={templateKey}
      locale="de"
      actionUrl="https://secretleaf.net/auth/v1/verify?token=preview-token-hash&type=signup&redirect_to=https%3A%2F%2Fsecretleaf.net%2Fde"
      recipientEmail="name@example.com"
    />
  );
  Preview.displayName = `${templateKey}Preview`;
  return Preview;
}
