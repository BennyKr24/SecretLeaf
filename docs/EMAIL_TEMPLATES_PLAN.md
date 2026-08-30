# E-Mail-Templates — Plan & Recherche

**Ziel:** Alle ausgehenden Mails (aktuell nur Supabase-Auth) bekommen ein
einheitliches, hochwertiges, marken­konformes Layout — Header/Banner, klarer
Textkörper, Footer mit Anschrift, wie man es von seriöser Software kennt.
Zweisprachig (DE/EN), zustellbar, in jedem relevanten Client sauber, kein
zusammengeklebtes Template.

Status-Legende: `[ ]` offen · `[~]` in Arbeit · `[x]` fertig & verifiziert

Branch: `benny/email-templates` (off `main`).

---

## 0. Ausgangslage (Code-Check 2026-08-31)

- **Kein eigener Mailer.** Kein `nodemailer`/`resend`/`@react-email/*` in
  `package.json`. Die einzigen Mails, die je rausgehen, sind Supabase-Auth-Mails.
- **Genutzte Auth-Flows** (`apps/web/src/lib/auth.ts` + `.../auth/page.tsx`):
  - `supabase.auth.signUp({ email, password })` — **kein** `emailRedirectTo`
    gesetzt → löst *Confirm signup* aus. Der Code behandelt explizit den
    „E-Mail-Bestätigung nötig, noch keine Session"-Fall → **E-Mail-Confirm
    ist aktiv**.
  - `supabase.auth.resetPasswordForEmail(email, { redirectTo: … })` → löst
    *Reset password* aus. `redirectTo` = `/{locale}/auth/reset` (Konstante
    `RESET_PATH` in `auth/page.tsx`).
  - `signInWithPassword` — keine Mail.
  - **Kein** Magic Link, OTP, OAuth, E-Mail-Änderung im UI.
- **Kein `supabase/config.toml`** im Repo → Supabase wird komplett übers
  gehostete Dashboard konfiguriert (auch die Auth-Mail-Templates). `supabase/`
  enthält nur `migrations/`, `rollbacks/`, `seed/`, `snippets/`.
- **Domain:** `secretleaf.net` (Prod-Web via `NEXT_PUBLIC_SITE_URL`), App-Deploy
  auf Vercel (`secretleaf.vercel.app`). Bestehende Server-Routen liegen als
  Next-Route-Handler unter `apps/web/src/app/api/*` (z. B. `api/billing/webhook`
  für Stripe) — dort gehört auch der Mail-Hook hin, **nicht** in `apps/api`
  (Fastify, separat, unklar ob deployed).
- **Impressum** (`apps/web/src/app/[locale]/impressum/page.tsx`):
  - Betreiber: **Benjamin Kreb, Am Kreuzstein 21, 66994 Dahn, Deutschland**
  - Kontakt: **contact@secretleaf.net**
  - **Status: privat, nicht-gewerblich, keine Umsatzerzielung** → aktuell
    *keine* volle Impressumspflicht nach § 5 DDG (kein Handelsregister, keine
    USt-ID). Das ändert sich mit Pro-Monetarisierung (Memory: ~Feb 2027).
- **Marke** (`DESIGN_SYSTEM.md` §5/§6, Quelle der Wahrheit `globals.css`):
  - Dark-first: BG `#070F0B`, Fläche `#0C1712`
  - Primary-Grün `#1FA971`, dark `#16875A`, deep-tint `#0F3226`
  - Gold-Akzent `#C9A15A` / `#A8813F` (sparsam, Premium-Momente)
  - Text `#F3F6F2`, muted `#8FA396`
  - Fonts: Space Grotesk (Display), Manrope (Body) — beide via `next/font`,
    **in E-Mail nicht verfügbar** → Fallback-Stack nötig.
  - Referenzen: Apple, Linear, Stripe. „Calm interfaces", „Premium before
    density", keine KI-/Crypto-/Themeforest-Optik.

---

## 1. Recherche — die Constraints, die das Design bestimmen

### 1.1 E-Mail-HTML ist nicht Web-HTML
- **Table-based Layout, Inline-CSS.** `<div>`-Flow-Layout, `<style>`-Blöcke,
  moderne HTML5-Tags (`<section>`, `<article>`), Flexbox/Grid, `rem`,
  `position`, externe Stylesheets, Web-Fonts per `@font-face` sind in Outlook
  (Windows, Word-Rendering-Engine) unzuverlässig bis tot. Standard bleibt
  XHTML-1.0-artiges `<table role="presentation">`-Layout, feste `px`, `<td>`
  statt `<div>`, alles kritische CSS **inline** am Element.
- **Breite ~600 px** Content-Spalte, zentriert; darunter volle Fluid-Breite
  fürs Mobile.
- **Preheader** (versteckter Vorschautext, ~90 Zeichen) als erstes Element im
  `<body>`, sonst zeigen Clients den ersten sichtbaren Text (oft „Falls die
  Mail nicht angezeigt wird…").
- **Bulletproof Button:** Hintergrundfarbe auf dem `<td>`, nicht auf dem `<a>`
  (Outlook ignoriert `background` auf Inline-Elementen, respektiert es auf
  Tabellenzellen). Touch-Target ≥ 44 px, Padding ~14 px / 28–32 px. Für
  Outlook zusätzlich ein `<!--[if mso]>`-VML-Fallback-Button oder das
  „padding-hack"-`<td>`.
- **Bilder:** absolute HTTPS-URLs, `width`/`height` als Attribut **und** im
  Style, `display:block`, sinnvoller `alt`. Bilder werden oft blockiert →
  Design muss ohne Bilder tragen (Logo als Text-/SVG-Fallback bedenken, kein
  bild-only-CTA).
  → Quelle: mailgenius, mailtrap, markaplugin, textmagic.

### 1.2 Dark Mode ist drei verschiedene Verhalten
- **Apple Mail (macOS/iOS):** invertiert helle Paletten aggressiv, respektiert
  aber `@media (prefers-color-scheme: dark)` und `color-scheme`.
- **Outlook Windows:** fasst Farben kaum an.
- **Gmail:** partielle Inversion, nur bestimmte Farbbereiche.
- **Gegenmittel:**
  - `<meta name="color-scheme" content="light dark">` +
    `<meta name="supported-color-schemes" content="light dark">` im `<head>`
  - `:root { color-scheme: light dark; }` im `<style>` (für Apple Mail Pflicht)
  - **hoher Kontrast:** nie graues Text auf Weiß — near-black auf hellem
    Grund, sonst reißt partielle Inversion die WCAG-AA-Kontrastwerte.
  - Für Clients mit echtem `prefers-color-scheme`-Support ein `@media`-Block,
    der nur die Rollen-Tokens umdefiniert (Header-BG, Card-BG, Text, Border).
  → Quelle: sendlayer, markaplugin (dark-mode), reactemailspro.

### 1.3 SecretLeaf ist dark-branded — Design-Entscheidung
Die App ist dark-first (`#070F0B`). Eine **dunkle E-Mail** direkt in Marken-BG
zu bauen ist verlockend, aber:
- Dunkle Mails werden von Clients mit Auto-Light-Mode teil-invertiert →
  unkalkulierbar. Dark-on-dark hat weniger Fallback-Sicherheit als
  light-on-light.
- Seriöse Transaktions-Mail-Referenzen (Stripe, Linear, Vercel, GitHub,
  Notion) sind **hell** mit Marken-Akzent, nicht in App-BG.

**→ Entscheidung: helle Basis, Marken-Akzent gezielt.** Weißer/off-white
Content-Grund (`#FFFFFF` Card auf `#F4F6F4` Canvas), near-black Text
(`#0C1712` = unsere Fläche als Textfarbe, liest edel), Primary-Grün nur für
CTA-Button, Links und einen schmalen Header-Streifen/Wordmark. Gold nur, wenn
es je eine Pro-/Rechnungs-Mail gibt. Optionaler `@media`-dark-Block, der die
Card auf `#0C1712` und Text auf `#F3F6F2` dreht — dann ist es *bewusst*
dunkel und nicht vom Client verunstaltet. Das ist die „theme-aware, aber
light-first"-Linie, die auch die Artifacts-Regeln vorgeben.

### 1.4 Typografie in E-Mail
Space Grotesk / Manrope laden nicht. Fallback-Stack:
- Headings: `"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI",
  Roboto, Helvetica, Arial, sans-serif` (der Client nimmt den ersten, den er
  hat — bei uns praktisch immer System-Sans; das ist ok, die Marke trägt über
  Farbe/Spacing/Ton, nicht über die Mail-Schrift).
- Body: gleicher Stack ohne Space Grotesk vorn.
- Größen: Body 15–16 px / `line-height: 1.6`, H1 ~22–24 px, Preheader 1 px
  hidden. Keine `rem`.

### 1.5 Supabase Auth — Templates & Grenzen
- **13 Template-Typen**: 6 Auth (*Confirm sign up, Invite user, Magic Link/OTP,
  Change email, Reset password, Reauthentication*) + 7 Security-Notifications
  (*Password changed, Email changed, Phone changed, Sign-in method
  linked/removed, Verification method added/removed* — nur wenn projektweit
  aktiviert).
- **Variablen**: `{{ .ConfirmationURL }}`, `{{ .Token }}` (6-stellige OTP),
  `{{ .TokenHash }}`, `{{ .SiteURL }}`, `{{ .RedirectTo }}`, `{{ .Email }}`,
  `{{ .NewEmail }}`/`{{ .OldEmail }}`, `{{ .Data }}` (= `user_metadata`).
- **Go-Templates** → Bedingungen möglich:
  `{{ if eq .Data.locale "en" }} … {{ else }} … {{ end }}`.
- **Nur EIN Template pro Typ. Keine eingebaute Locale-Variante.**
- **Eingebauter Mailversand: 2 Mails/Stunde, „not for production".** Für
  Custom SMTP hebt Supabase auf 30/h an (in den Rate-Limit-Settings weiter
  hochsetzbar). Absender-Adresse muss auf einer Domain liegen, die man
  kontrolliert, mit SPF/DKIM/DMARC.
- **Link-Prefetch-Problem**: Spamfilter/Safe-Links (Microsoft Defender u. a.)
  rufen Links in Mails vorab auf → Token wird „verbraucht", Nutzer sieht
  „Link abgelaufen". Gegenmittel: OTP statt Link, oder eine
  Zwischenseite/Bestätigen-per-Klick nach Laden.
- **Kein Link-Tracking** einbauen (Redirect-Rewriter brechen die
  Supabase-Links).
  → Quelle: Supabase Docs (auth-email-templates, auth-smtp, send-email-hook),
  Supabase-Blog (7 neue Templates).

### 1.6 Zweisprachigkeit — die drei Optionen
| Option | Wie | Bewertung |
|---|---|---|
| **A) Bilingual im selben Body** | DE-Block, Trennlinie, EN-Block im Dashboard-Template | Kein Code, aber doppelt lange Mail, wirkt billig, Betreff kann nicht zweisprachig |
| **B) Go-`if` auf `{{ .Data.locale }}`** | `locale` beim `signUp` in `user_metadata` schreiben, Dashboard-Template mit `{{ if eq .Data.locale "en" }}…` | Kein neuer Vendor, ein Template, aber: Betreff auch nur per `if`, HTML im Dashboard-Textfeld pflegen (kein Build/Test/Preview), Reset-Mail hat kein `user_metadata` vom Absende-Zeitpunkt garantiert |
| **C) Send Email Hook** | Supabase ruft unseren HTTPS-Endpoint mit dem Payload, **wir** rendern (React Email, locale-aware) und versenden (Resend). Ersetzt Supabase-Mailversand komplett. | Neuer Vendor (Resend) + ein Endpoint, aber: volle Design-Kontrolle, echte Templates im Repo (Build, Preview, Test, Review), Betreff+Body locale-aware, dieselben Templates später für app-eigene Mails nutzbar. |

**→ Entscheidung: Option C (Send Email Hook + Resend + React Email).** Das ist
die einzige Variante, bei der die Templates versioniert im Repo liegen,
lokal previewbar sind und „auf Profi-Niveau" review-/testbar. B wäre ein
Dashboard-Textfeld-Bastel; A ist qualitativ raus.

### 1.7 Deliverability — Domain & DNS
- **Eigene Versand-Subdomain**, nicht die Root: Resend & alle Guides
  empfehlen z. B. `mail.secretleaf.net` (oder `send.` / `notifications.`).
  Trennt Reputation der Transaktions-Mails von evtl. späterem Newsletter und
  von manuell aus Postfächern gesendeten Mails.
- **DNS auf der Subdomain** (Resend generiert die Werte):
  - **SPF**: `TXT` `mail.secretleaf.net` → `v=spf1 include:_spf.resend.com ~all`
  - **DKIM**: `TXT` `resend._domainkey.mail.secretleaf.net` → Public Key
  - **MX** (für Bounce-Handling / Return-Path): `feedback-smtp…` MX-Record
  - **DMARC**: `TXT` `_dmarc.secretleaf.net` (auf der *Root*, gilt für
    Subdomains mit) → Start `p=none; rua=mailto:dmarc@secretleaf.net`, nach
    2–4 Wochen sauberer Reports auf `p=quarantine`, dann `p=reject`.
- **Absender**: `SecretLeaf <noreply@mail.secretleaf.net>`, `Reply-To:
  contact@secretleaf.net` (Antworten sollen bei einem echten Postfach landen).
  → Quelle: Resend Docs (getting-started-with-supabase, configure-supabase),
  Supabase auth-smtp.

### 1.8 Rechtliches (DE) — Footer
- **Jetzt (nicht-gewerblich):** *keine* gesetzliche Impressumspflicht in der
  Mail. Trotzdem in den Footer, weil es professionell wirkt und den Umstieg
  vorbereitet:
  - Betreiber-Name + vollständige **Postanschrift** (als Text, nicht nur
    Link)
  - Kontakt-E-Mail
  - kurzer Zweck-Satz + Link auf `/impressum` und `/datenschutz`
- **Später (mit Pro / gewerblich, § 5 DDG):** geschäftliche Mails brauchen die
  **vollständigen Pflichtangaben als Text in jeder Mail** (Name/Firma,
  Anschrift, E-Mail, ggf. Telefon, USt-ID sobald vergeben, ggf.
  Registergericht/-nummer, Vertretungsberechtigter). Bloßer Link genügt
  **nicht**. Bußgeld bis 50.000 € (§ 33 DDG), zusätzlich UWG-abmahnfähig.
  → Der Footer-Baustein muss so gebaut sein, dass diese Felder per Config
  ergänzt werden, ohne die Templates anzufassen.
- **Transaktions- vs. Werbe-Mail:** Confirm/Reset sind **kein** „elektronische
  Post zu Werbezwecken" → keine Einwilligung, kein Pflicht-Abmeldelink. Sobald
  *irgendein* werblicher Satz reinrutscht (z. B. „Schau dir auch unsere Tools
  an"), kippt die ganze Mail in die Werbe-Kategorie mit Einwilligungspflicht.
  → **Transaktions-Templates strikt transaktional halten**, kein Cross-Sell.
  → Quelle: e-recht24, dr-dsgvo, IHK-Merkblatt Impressumspflichten 2025,
  trustedshops.

---

## 2. Architektur-Entscheidung (zusammengefasst)

```
supabase.auth.signUp / resetPasswordForEmail
        │
        ▼  (Auth Hook: "Send Email", HTTPS)
POST https://secretleaf.net/api/auth/send-email       ← Next Route Handler in apps/web
        │  standardwebhooks-Signatur prüfen (SEND_EMAIL_HOOK_SECRET, "v1,whsec_…")
        │  Payload: { user, email_data:{ token_hash, redirect_to, email_action_type, site_url, … } }
        ▼
  locale = user.user_metadata.locale ?? "de"
  Template nach email_action_type wählen  (confirm | recovery | …)
  React Email → renderAsync(...) → HTML + Plaintext
        ▼
  Resend: resend.emails.send({ from, to:user.email, reply_to, subject, html, text })
        ▼
  200 {}   (Supabase versendet dann NICHTS selbst)
```

- **Warum Next-Route und nicht Supabase Edge Function:** die Stripe-Webhook-
  Logik liegt schon als `apps/web/src/app/api/billing/webhook/route.ts`. Ein
  zweites Deploy-Target (Deno/Edge Functions) wäre unnötige Betriebsfläche.
  Der Hook braucht nur eine öffentlich erreichbare HTTPS-URL — Vercel liefert
  die.
- **Fallback-Sicherheit:** Wenn der Hook 500t / Resend down ist, kommt die
  Mail **nicht** an (Supabase versendet nichts mehr selbst, sobald der Hook
  aktiv ist). Deshalb: Endpoint defensiv (try/catch, Timeout, Logging), und
  als Notaus lässt sich der Hook im Dashboard mit einem Klick deaktivieren →
  Supabase fällt auf die eingebauten Templates + Custom SMTP zurück. Darum
  **Custom SMTP trotzdem einrichten** (Resend als SMTP), auch wenn der Hook
  aktiv ist — es ist das Sicherheitsnetz.

### Vendor
- **Resend**: React-Email-Integration, ein API-Key, kein SMTP-Frickel, DNS-
  Assistent, kostenloses Kontingent deckt Auth-Volumen locker. Keine
  Lock-in-Sorge — die Templates sind reines React/HTML, der Versand ist ein
  3-Zeilen-Adapter.
- Alternative wäre „Custom SMTP mit eigenem Provider" ohne Hook (nur Supabase-
  Dashboard-Templates) — verworfen wegen §1.6/B.

---

## 3. Design-Spec — das E-Mail-Grundgerüst

**Ein `BaseLayout`-React-Email-Component**, alle Templates rendern darin.

```
┌───────────────────────────────────────────────┐   Canvas #F4F6F4 (dark: #070F0B)
│                                               │
│   ┌───────────────────────────────────────┐   │   Card #FFFFFF (dark: #0C1712)
│   │  ▍ SecretLeaf                          │   │   Header: 4px Primary-Streifen links
│   │    Grow Operating System               │   │   Wordmark Space-Grotesk-Fallback,
│   │                                        │   │   near-black; Sub-Label muted, 11px caps
│   ├───────────────────────────────────────┤   │   1px Border #E6EAE7
│   │                                        │   │
│   │  H1  Bestätige deine E-Mail-Adresse    │   │   22px / 700 / near-black
│   │                                        │   │
│   │  Body-Absatz, 15–16px, 1.6, #33413A.   │   │
│   │  Max ~2 kurze Absätze.                 │   │
│   │                                        │   │
│   │        ┌────────────────────────┐      │   │   Bulletproof Button:
│   │        │   E-Mail bestätigen    │      │   │   td bg #1FA971, text #fff, 700,
│   │        └────────────────────────┘      │   │   padding 14/30, radius 10, ≥44px
│   │                                        │   │
│   │  Fallback-Zeile: „Button geht nicht?   │   │   12px muted + rohe URL als <a>,
│   │  Kopiere diesen Link: https://…"       │   │   word-break:break-all
│   │                                        │   │
│   │  Sicherheits-/Ablauf-Hinweis (12px):   │   │   „Der Link ist 24 h gültig. Wenn du
│   │  „Wenn du das nicht warst, ignoriere   │   │    das nicht angefordert hast, …"
│   │   diese E-Mail."                       │   │
│   └───────────────────────────────────────┘   │
│                                               │
│   Footer (außerhalb der Card, 12px muted):    │   #7A8A80
│   SecretLeaf · Benjamin Kreb                  │
│   Am Kreuzstein 21 · 66994 Dahn · Deutschland │
│   contact@secretleaf.net                      │
│   Impressum · Datenschutz                     │   Links → secretleaf.net/impressum …
│                                               │
│   „Diese E-Mail wurde an you@example.com      │   Empfänger-Transparenz
│    gesendet, weil ein Konto damit             │
│    registriert/zurückgesetzt wurde."          │
└───────────────────────────────────────────────┘
```

**Tokens (light / dark):**
| Rolle | light | dark (`@media prefers-color-scheme`) |
|---|---|---|
| canvas | `#F4F6F4` | `#070F0B` |
| card | `#FFFFFF` | `#0C1712` |
| border | `#E6EAE7` | `#1C2A23` |
| text | `#1B241F` | `#F3F6F2` |
| text-muted | `#5B6B61` | `#8FA396` |
| primary (CTA/Link) | `#1FA971` | `#3FBF8A` (heller, damit auf dark lesbar) |
| primary-text-on | `#FFFFFF` | `#06130D` |

**Regeln:**
- `role="presentation"` an allen Layout-Tabellen, `border-collapse:collapse`,
  `cellpadding=0 cellspacing=0`.
- Jede kritische Deklaration inline. Der `@media`-dark-Block + `color-scheme`
  im `<style>` im `<head>` (React Email `<Head>`).
- Kein Bild zwingend nötig. Wordmark als Text. *Falls* ein Logo-PNG:
  `apps/web/public/` (absolute URL `https://secretleaf.net/…`), max ~140px
  breit, `alt="SecretLeaf"`, nie als einziger Klick-Pfad.
- **Plaintext-Variante** zu jeder Mail (Resend nimmt `text` + `html`) — besser
  Zustellrate, Pflicht für „gut gemacht".
- Preheader-Component: `<span style="display:none;max-height:0;overflow:hidden">`
  mit ~90 Zeichen Zusammenfassung, danach `&#847;&zwnj;…`-Whitespace-Hack,
  damit Clients nicht den Footer als Vorschau ziehen.

---

## 4. Template-Inventar

| # | Supabase-Typ | `email_action_type` | Wann | DE-Betreff | EN-Betreff |
|---|---|---|---|---|---|
| 1 | Confirm sign up | `signup` | Registrierung | „Bestätige deine E-Mail-Adresse für SecretLeaf" | „Confirm your email for SecretLeaf" |
| 2 | Reset password | `recovery` | Passwort vergessen | „Setze dein SecretLeaf-Passwort zurück" | „Reset your SecretLeaf password" |
| 3 | *(Vorbereitet, inaktiv)* Change email | `email_change` | falls je E-Mail-Änderung im UI | „Bestätige deine neue E-Mail-Adresse" | „Confirm your new email address" |
| 4 | *(Vorbereitet, inaktiv)* Magic Link | `magiclink` | falls je passwortlos | „Dein Anmeldelink für SecretLeaf" | „Your SecretLeaf sign-in link" |

- **In Scope jetzt:** #1, #2. #3/#4 als Template-Datei anlegen (kostet fast
  nichts, hält das `switch` vollständig), aber der Hook wird nur für die
  aktiven Typen scharf; unbekannte Typen → 200 + Log, damit nichts kaputt geht.
- **Security-Notifications** (Password changed etc.): **nicht** in Phase 1.
  Später sinnvoll (Sicherheitsgewinn), dann als weitere `switch`-Fälle. Als
  eigener TODO.

**Copy-Prinzipien** (an `feedback_copywriting_no_ai_kitsch` + DESIGN_SYSTEM):
- Nüchtern-deklarativ. Kein Marketing, keine Rhetorik-Figuren, kein
  „Willkommen in der SecretLeaf-Familie".
- 1 klare Handlung pro Mail, 1 Button.
- Ablauf-/Sicherheitshinweis immer.
- Kein Cross-Sell, keine Links außer CTA + Footer-Legal (§1.8).
- Vollständige DE- & EN-Strings im Plan-Anhang / in den Template-Dateien.

---

## 5. Umsetzungsplan (Phasen)

### Phase 0 — Entscheidungen (Benny) `[ ]`
- [ ] Vendor **Resend** ok? (kostenloses Kontingent reicht; Alternative wäre
      SES/Postmark — mehr Setup, kein React-Email-Komfort)
- [ ] Versand-Subdomain-Name: **`mail.secretleaf.net`** ok?
- [ ] Absender-Anzeigename: **„SecretLeaf"**, Adresse
      **`noreply@mail.secretleaf.net`**, `Reply-To` **`contact@secretleaf.net`** ok?
- [ ] DNS von `secretleaf.net`: wo liegt die Zone (Registrar / Vercel DNS /
      Cloudflare)? Wer trägt die 4 Records ein — du, oder ich gebe dir die
      exakten Zeilen?
- [ ] DMARC-Report-Adresse (`dmarc@secretleaf.net` anlegen?)

### Phase 1 — Fundament & Design-Grundgerüst `[ ]`
- [ ] `apps/web`: `resend`, `@react-email/components`, `@react-email/render`,
      dev: `react-email` (Preview-Server) als deps.
- [ ] `apps/web/emails/` — Verzeichnis für Templates:
  - `_components/BaseLayout.tsx` (Head+color-scheme, Canvas, Card, Header-
    Wordmark, Footer-mit-Anschrift, Preheader, Button, Fallback-Link-Zeile)
  - `_components/tokens.ts` (die Farb-Tokens aus §3, an DESIGN_SYSTEM
    gepinnt + Kommentar „gespiegelt aus globals.css")
  - `_i18n.ts` (DE/EN-Strings pro Template; **eigene** kleine Map, *nicht*
    `next-intl` — E-Mails laufen außerhalb des Request-Context)
  - `confirm-signup.tsx`, `reset-password.tsx`, `change-email.tsx`,
    `magic-link.tsx`
  - `_legal.ts` (Betreiber/Anschrift/USt-ID-Slot als eine Config-Konstante,
    die der Footer rendert — §1.8 zukunftssicher)
- [ ] `react-email dev` lokal: alle 4 Templates in beiden Sprachen visuell
      abnehmen.

### Phase 2 — Hook-Endpoint `[ ]`
- [ ] `apps/web/src/app/api/auth/send-email/route.ts`:
  - `POST`, `standardwebhooks`-Verify mit `SEND_EMAIL_HOOK_SECRET`
    (Prefix `v1,whsec_` abschneiden), 401 bei Fehler, 405 bei non-POST
  - Payload parsen (`user`, `email_data`)
  - `buildActionLink()`:
    `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || fallback)}`
  - `locale = user.user_metadata?.locale === "en" ? "en" : "de"`
  - `switch (email_action_type)` → Template + Betreff wählen; default → `200 {}`
    + `console.warn` (nie werfen)
  - `renderAsync(<Template …/>)` → html; Plaintext-Variante
  - `resend.emails.send({ from, to, replyTo, subject, html, text })`
  - try/catch um den Send: bei Fehler `500` (Supabase retryt / loggt), Fehler
    strukturiert loggen (Sentry ist im Repo, aber opt-in-gated → hier
    `console.error` mit `request_id`)
  - `return Response.json({}, { status: 200 })`
- [ ] Env: `RESEND_API_KEY`, `SEND_EMAIL_HOOK_SECRET`, `EMAIL_FROM`,
      `EMAIL_REPLY_TO`, `NEXT_PUBLIC_SITE_URL` (existiert). In
      `apps/web/.env.local` + Vercel.
- [ ] **CSP** (`next.config.mjs`): der Endpoint macht einen Server→Resend-
      `fetch` → `connect-src` ist irrelevant (Server-Fetch). Nichts zu tun,
      nur gegenprüfen, dass keine `img-src`/`connect-src`-Regel Resend-Assets
      bräuchte (nein).

### Phase 3 — `locale` in `user_metadata` `[ ]`
- [ ] `registerWithSupabase` (`apps/web/src/lib/auth.ts`): `signUp` um
      `options.data.locale` erweitern — den aktuellen `useLocale()`/Pfad-Locale
      mitgeben. Damit hat der Hook bei **Confirm** die Sprache.
- [ ] **Reset-Password**: `resetPasswordForEmail` schreibt kein
      `user_metadata`. Der Hook bekommt aber `user.user_metadata` des
      **bestehenden** Users → wenn der bei Registrierung gesetzt wurde, passt's.
      Für Alt-User ohne `locale`: Fallback `de`. Optional: `redirect_to`
      enthält den Locale-Pfad (`/en/auth/reset`) → daraus die Sprache ableiten
      als zweite Quelle. **Im Hook beide Quellen prüfen** (metadata → sonst
      redirect_to-Pfadsegment → sonst `de`).

### Phase 4 — Supabase-Konfiguration (Dashboard, Benny + ich Anleitung) `[ ]`
- [ ] Resend-Account, Domain `mail.secretleaf.net` hinzufügen, DNS-Records
      setzen, Verifikation abwarten.
- [ ] Supabase → Auth → **Custom SMTP** = Resend (Sicherheitsnetz, s. §2):
      Host `smtp.resend.com`, Port 465, User `resend`, Pass = API-Key, Sender
      = `noreply@mail.secretleaf.net`, Sender-Name „SecretLeaf".
- [ ] Supabase → Auth → **Rate Limits**: E-Mail von 30/h auf einen sinnvollen
      Wert (z. B. 100/h) — je nach erwartetem Signup-Volumen.
- [ ] Supabase → Auth → Hooks → **Send Email Hook** aktivieren, URL
      `https://secretleaf.net/api/auth/send-email`, Secret generieren →
      in Vercel als `SEND_EMAIL_HOOK_SECRET`.
- [ ] Die Dashboard-Templates (Confirm/Reset) auf ein **schlichtes,
      korrektes Minimal-HTML** setzen (nicht der Supabase-Default) — sie
      greifen nur, wenn der Hook mal aus ist. Gleicher Absender, gleiche
      Kernaussage, ohne das volle Grundgerüst.

### Phase 5 — Test & QA `[ ]`
- [ ] `react-email` Preview: visueller Abnahme-Durchlauf DE+EN, light+dark.
- [ ] **Echter End-to-End**: Test-Signup + Passwort-Reset gegen Staging/Prod,
      Mail an echte Postfächer:
  - Gmail Web + Gmail App (Android/iOS)
  - Apple Mail (macOS) + iOS Mail — inkl. System-Dark-Mode an/aus
  - Outlook.com (Web) + Outlook Windows (Desktop, wenn erreichbar)
- [ ] **Spam-Score**: `mail-tester.com` (Ziel ≥ 9/10), Header prüfen
      (`SPF=pass`, `DKIM=pass`, `DMARC=pass`).
- [ ] Bilder blockiert → Mail noch verständlich? Button klickbar?
- [ ] Link-Prefetch: Confirm-Link nach „Öffnen in Outlook/Defender" noch
      gültig? Wenn Probleme → Zwischenseite `/{locale}/auth/confirm` bauen, die
      den `verifyOtp` erst per Button-Klick macht (§1.5). *Erst wenn's real
      klemmt* — nicht prophylaktisch.
- [ ] Notaus getestet: Hook im Dashboard aus → kommen die Fallback-
      Dashboard-Mails über Resend-SMTP an?

### Phase 6 — Doku & Übergabe `[ ]`
- [ ] `apps/web/emails/README.md`: wie previewen, wie neuen Template-Typ
      ergänzen, welche Env-Vars, wo die Supabase-Schalter sitzen.
- [ ] `TODO.md` §✉️ ersetzen durch „erledigt / offene Security-Notifications".
- [ ] Memory-Eintrag aktualisieren.

---

## 6. Explizit NICHT in Scope
- Newsletter / Marketing-Mails (eigenes Consent, eigenes Tooling, eigener
  DKIM-Subdomain-Split).
- Security-Notification-Mails (Phase 2 später).
- Kontaktformular / Support-Antworten (es gibt kein Kontaktformular).
- Rechnungs-/Pro-Mails (kommen mit der Pro-Monetarisierung, dann Gold-Akzent
  + volle § 5 DDG-Pflichtangaben aktivieren — der `_legal.ts`-Slot ist dafür
  da).

---

## 7. Risiken / offene Punkte
- **Alt-User ohne `user_metadata.locale`** bekommen DE (bzw. den
  `redirect_to`-Fallback). Akzeptabel, Nutzerbasis ist klein.
- **Hook = Single Point of Failure für alle Auth-Mails.** Mitigation: Custom
  SMTP als Fallback + 1-Klick-Deaktivierung + defensives Logging. Kein Retry
  im Endpoint (Supabase macht das).
- **`secretleaf.net` vs. `secretleaf.vercel.app`** — `NEXT_PUBLIC_SITE_URL`
  und der Supabase-`site_url` müssen konsistent auf die Domain zeigen, die
  auch im `verify`-Link steckt, sonst brechen die Bestätigungslinks. Vor
  Phase 4 verifizieren.
- **DNS-Zugriff** ist der wahrscheinlichste Blocker — hängt davon ab, wo die
  `secretleaf.net`-Zone liegt (Phase 0).

---

## 8. Quellen (Recherche 2026-08-31)

- Supabase — Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates
- Supabase — Send Email Hook: https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
- Supabase — Custom Auth Emails mit React Email + Resend: https://supabase.com/docs/guides/functions/examples/auth-send-email-hook-react-email-resend
- Supabase — Custom SMTP (2 Mails/h Limit, 30/h nach Custom SMTP): https://supabase.com/docs/guides/auth/auth-smtp
- Supabase Blog — 7 neue Auth-Templates: https://supabase.com/blog/introducing-seven-new-email-templates-for-auth
- Resend — Getting started mit Supabase: https://resend.com/docs/knowledge-base/getting-started-with-resend-and-supabase
- Resend — Supabase von eigener Domain senden: https://resend.com/blog/how-to-configure-supabase-to-send-emails-from-your-domain
- HTML-E-Mail Best Practices 2026: https://www.mailgenius.com/email-html-best-practices/
- Transactional Emails Best Practices: https://mailtrap.io/blog/transactional-emails-best-practices/
- HTML Email Best Practices (Clients): https://markaplugin.com/blog/html-email-best-practices-2026
- Dark Mode Email Guide (CSS/color-scheme): https://sendlayer.com/blog/designing-emails-dark-mode-best-practices/
- Dark Mode ohne Outlook zu brechen: https://markaplugin.com/blog/dark-mode-email-design
- React Email Dark Mode (color-scheme, Kontrast): https://reactemailspro.com/blog/dark-mode-email-design-react
- Impressumspflicht / § 5 DDG (2025, DDG löst TMG ab): https://www.e-recht24.de/artikel/datenschutz/209.html
- Impressumspflicht in E-Mails/Newslettern (Link genügt nicht): https://dr-dsgvo.de/impressumspflicht-in-emails-und-newslettern/
- IHK — Impressumspflichten 2025 (PDF): https://www.ihk.de/blueprint/servlet/resource/blob/5372588/d5288ae52241edc3b6ca6c16c5b36a66/impressumspflichten-2025-data.pdf
- E-Mails rechtssicher / werbefrei gestalten: https://business.trustedshops.de/blog/legal/e-mails-rechtssicher-gestalten
