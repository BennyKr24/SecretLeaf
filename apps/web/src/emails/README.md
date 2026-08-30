# Transactional email templates

React-Email-Templates für alle Auth-Mails. Voller Plan (Architektur, Recherche,
Konto-Setup): **`docs/EMAIL_TEMPLATES_PLAN.md`**.

## Wie es zusammenhängt

```
Supabase Auth (signUp / resetPasswordForEmail)
  → Send Email Hook → POST /api/auth/send-email  (src/app/api/auth/send-email/route.ts)
      → render()  (src/emails/render.ts → ActionEmail → BaseLayout)
      → Brevo Transactional API  (src/lib/email/brevo.ts)
```

Ist der Hook im Supabase-Dashboard **aktiv**, versendet Supabase selbst keine
Mails mehr. Notaus: Hook im Dashboard deaktivieren → Fallback auf die
eingebauten Templates + Custom SMTP (Brevo-Relay).

## Dateien

| Datei | Zweck |
|---|---|
| `_theme.ts` | Farb-Tokens (light-first) + Font-Stack. An `DESIGN_SYSTEM.md` §5 angelehnt. |
| `_legal.ts` | Footer-Rechtsdaten. `commercial: true` + `vatId` befüllen, wenn gewerblich (§ 5 DDG). |
| `_strings.ts` | DE/EN-Copy pro Template. Nüchtern, kein Marketing. |
| `BaseLayout.tsx` | Card + Header-Wordmark + Footer + Dark-Mode-`@media`-Block. |
| `ActionEmail.tsx` | Gemeinsames Muster: Heading, Absätze, CTA-Button, Fallback-Link, Sicherheitshinweis. |
| `render.ts` | `email_action_type` → Template, Locale-Auflösung, Verify-URL, `render()` → `{ subject, html, text }`. |
| `Preview*.tsx` | Dev-Preview-Einstiege für den `react-email`-Server. |

## Lokal ansehen

```
npm run -w @secretleaf/web email:dev      # http://localhost:3010
```

EN-Variante: im jeweiligen `Preview*.tsx` `locale="de"` → `"en"`.

Als HTML/Text rendern (Sanity-Check ohne Server):

```
cd apps/web && npx tsx -e "import('./src/emails/render.ts').then(async m => { \
  const url = m.buildActionUrl({ siteUrl:'https://secretleaf.net', tokenHash:'x', action:'signup', redirectTo:'https://secretleaf.net/de' }); \
  console.log((await m.renderActionEmail({ templateKey:'confirmSignup', locale:'de', actionUrl:url, recipientEmail:'a@b.c' })).html); })"
```

## Neuen Template-Typ ergänzen

1. Copy in `_strings.ts` (`de` + `en`) unter neuem Key.
2. Key in `ActionEmail.tsx` → `ActionTemplateKey` aufnehmen.
3. In `render.ts` → `ACTION_MAP` den Supabase-`email_action_type` mappen.
4. `Preview<Name>.tsx` anlegen.
5. Falls der Flow einen eigenen Look braucht: eigenes Component statt `ActionEmail`.

Nicht gemappte `email_action_type` (invite, reauthentication) → der Hook loggt
sie und sendet nichts (200). Werden die Flows aktiviert, gehören eigene
Templates dazu.

## Env

`BREVO_API_KEY`, `SEND_EMAIL_HOOK_SECRET`, `EMAIL_FROM`, `EMAIL_FROM_NAME`,
`EMAIL_REPLY_TO` — siehe `apps/web/.env.example`.
