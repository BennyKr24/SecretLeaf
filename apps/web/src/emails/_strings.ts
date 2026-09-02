// ────────────────────────────────────────────────────────────────────────────
// Mail-Copy DE/EN. Eigene kleine Map — NICHT next-intl: E-Mails werden im Hook
// gerendert, außerhalb des Request-Context.
//
// Ton (DESIGN_SYSTEM.md + feedback "no AI kitsch"): nüchtern-deklarativ, eine
// Handlung pro Mail, kein Marketing, kein "Willkommen in der Familie".
// ────────────────────────────────────────────────────────────────────────────

export type EmailLocale = "de" | "en";

export type EmailCopy = {
  subject: string;
  preheader: string;
  heading: string;
  /** Ein bis zwei kurze Absätze über dem Button. */
  intro: string[];
  cta: string;
  /** "Button geht nicht?" + roher Link folgt in der Vorlage. */
  fallbackIntro: string;
  /** Gültigkeitsdauer + "warst du das nicht?". */
  securityNote: string;
  /** Footer: warum bekomme ich diese Mail. {email} wird ersetzt. */
  reason: string;
};

type TemplateKey = "confirmSignup" | "resetPassword" | "changeEmail" | "magicLink";

const footerLinks = {
  de: { imprint: "Impressum", privacy: "Datenschutz" },
  en: { imprint: "Legal notice", privacy: "Privacy" },
};

export const footerText = footerLinks;

export const strings: Record<TemplateKey, Record<EmailLocale, EmailCopy>> = {
  confirmSignup: {
    de: {
      subject: "Bestätige deine E-Mail-Adresse für SecretLeaf",
      preheader:
        "Ein Klick, um dein SecretLeaf-Konto zu aktivieren. Der Link ist 24 Stunden gültig.",
      heading: "Bestätige deine E-Mail-Adresse",
      intro: [
        "Für diese E-Mail-Adresse wurde ein SecretLeaf-Konto angelegt. Bestätige sie, um das Konto zu aktivieren.",
      ],
      cta: "E-Mail bestätigen",
      fallbackIntro: "Falls der Button nicht funktioniert, öffne diesen Link im Browser:",
      securityNote:
        "Der Link ist 24 Stunden gültig. Wenn du dich nicht bei SecretLeaf registriert hast, ignoriere diese E-Mail — es passiert dann nichts.",
      reason:
        "Diese E-Mail wurde an {email} gesendet, weil damit ein SecretLeaf-Konto registriert wurde.",
    },
    en: {
      subject: "Confirm your email for SecretLeaf",
      preheader:
        "One click to activate your SecretLeaf account. The link is valid for 24 hours.",
      heading: "Confirm your email address",
      intro: [
        "A SecretLeaf account was created for this email address. Confirm it to activate the account.",
      ],
      cta: "Confirm email",
      fallbackIntro: "If the button does not work, open this link in your browser:",
      securityNote:
        "The link is valid for 24 hours. If you did not sign up for SecretLeaf, ignore this email — nothing will happen.",
      reason:
        "This email was sent to {email} because a SecretLeaf account was registered with it.",
    },
  },

  resetPassword: {
    de: {
      subject: "Setze dein SecretLeaf-Passwort zurück",
      preheader:
        "Link zum Zurücksetzen deines Passworts. Gültig für eine Stunde.",
      heading: "Passwort zurücksetzen",
      intro: [
        "Für dein SecretLeaf-Konto wurde ein neues Passwort angefordert. Klicke auf den Button, um eines festzulegen.",
      ],
      cta: "Neues Passwort festlegen",
      fallbackIntro: "Falls der Button nicht funktioniert, öffne diesen Link im Browser:",
      securityNote:
        "Der Link ist eine Stunde gültig und lässt sich nur einmal verwenden. Wenn du das nicht angefordert hast, ändert sich nichts an deinem Passwort — du kannst diese E-Mail ignorieren.",
      reason:
        "Diese E-Mail wurde an {email} gesendet, weil für dieses Konto ein Passwort-Reset angefordert wurde.",
    },
    en: {
      subject: "Reset your SecretLeaf password",
      preheader: "Link to reset your password. Valid for one hour.",
      heading: "Reset your password",
      intro: [
        "A new password was requested for your SecretLeaf account. Click the button to set one.",
      ],
      cta: "Set a new password",
      fallbackIntro: "If the button does not work, open this link in your browser:",
      securityNote:
        "The link is valid for one hour and can only be used once. If you did not request this, your password stays unchanged and you can ignore this email.",
      reason:
        "This email was sent to {email} because a password reset was requested for this account.",
    },
  },

  changeEmail: {
    de: {
      subject: "Bestätige deine neue E-Mail-Adresse",
      preheader: "Bestätige die Änderung der E-Mail-Adresse deines SecretLeaf-Kontos.",
      heading: "Neue E-Mail-Adresse bestätigen",
      intro: [
        "Für dein SecretLeaf-Konto wurde diese E-Mail-Adresse als neue Adresse hinterlegt. Bestätige sie, um die Änderung abzuschließen.",
      ],
      cta: "Adresse bestätigen",
      fallbackIntro: "Falls der Button nicht funktioniert, öffne diesen Link im Browser:",
      securityNote:
        "Wenn du diese Änderung nicht veranlasst hast, wende dich an contact@secretleaf.net.",
      reason:
        "Diese E-Mail wurde an {email} gesendet, weil sie als neue Adresse für ein SecretLeaf-Konto angegeben wurde.",
    },
    en: {
      subject: "Confirm your new email address",
      preheader: "Confirm the email address change for your SecretLeaf account.",
      heading: "Confirm your new email address",
      intro: [
        "This email address was set as the new address for your SecretLeaf account. Confirm it to complete the change.",
      ],
      cta: "Confirm address",
      fallbackIntro: "If the button does not work, open this link in your browser:",
      securityNote:
        "If you did not request this change, contact contact@secretleaf.net.",
      reason:
        "This email was sent to {email} because it was given as the new address for a SecretLeaf account.",
    },
  },

  magicLink: {
    de: {
      subject: "Dein Anmeldelink für SecretLeaf",
      preheader: "Einmal-Link zum Anmelden. Gültig für eine Stunde.",
      heading: "Bei SecretLeaf anmelden",
      intro: ["Klicke auf den Button, um dich anzumelden."],
      cta: "Anmelden",
      fallbackIntro: "Falls der Button nicht funktioniert, öffne diesen Link im Browser:",
      securityNote:
        "Der Link ist eine Stunde gültig und lässt sich nur einmal verwenden. Wenn du das nicht angefordert hast, ignoriere diese E-Mail.",
      reason:
        "Diese E-Mail wurde an {email} gesendet, weil für dieses Konto ein Anmeldelink angefordert wurde.",
    },
    en: {
      subject: "Your SecretLeaf sign-in link",
      preheader: "One-time link to sign in. Valid for one hour.",
      heading: "Sign in to SecretLeaf",
      intro: ["Click the button to sign in."],
      cta: "Sign in",
      fallbackIntro: "If the button does not work, open this link in your browser:",
      securityNote:
        "The link is valid for one hour and can only be used once. If you did not request this, ignore this email.",
      reason:
        "This email was sent to {email} because a sign-in link was requested for this account.",
    },
  },
};
