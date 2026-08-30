import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – SecretLeaf",
  robots: { index: true, follow: true },
};

export default async function DatenschutzPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="min-h-screen px-6 py-12">
      <section className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/90 p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-foreground">Datenschutzerklärung</h1>

        {locale === "en" && (
          <p className="mt-3 rounded-xl border border-border bg-background p-4 text-sm text-muted-fg">
            This privacy policy is provided in German. If you need an English summary of how your
            data is processed, contact us at contact@secretleaf.net.
          </p>
        )}

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-bold text-foreground">1. Verantwortlicher</h2>
            <p className="mt-2">
              Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der DSGVO ist:
            </p>
            <p className="mt-2">
              Benjamin Kreb
              <br />
              Am Kreuzstein 21
              <br />
              66994 Dahn
              <br />
              Deutschland
              <br />
              E-Mail:{" "}
              <a href="mailto:contact@secretleaf.net" className="font-semibold text-[#1f7a4f] hover:text-[#17613f]">
                contact@secretleaf.net
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">2. Grundsätzliches zur Datenverarbeitung</h2>
            <p className="mt-2">
              Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit
              dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und
              Leistungen erforderlich ist. Die Verarbeitung erfolgt regelmäßig nur nach
              Einwilligung der Nutzer (Art. 6 Abs. 1 lit. a DSGVO), zur Erfüllung eines Vertrags
              bzw. vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO) oder soweit die
              Verarbeitung zur Wahrung berechtigter Interessen erforderlich ist (Art. 6 Abs. 1
              lit. f DSGVO), etwa für den technisch fehlerfreien und sicheren Betrieb der Website.
            </p>
            <p className="mt-2">
              Wir setzen <strong>keine</strong> Cookies oder vergleichbaren Technologien zu
              Werbe-, Profilbildungs- oder seitenübergreifenden Tracking-Zwecken ein. Ein Zugriff
              auf Informationen in deinem Endgerät, der über das technisch Notwendige hinausgeht,
              erfolgt ausschließlich mit deiner Einwilligung (§ 25 Abs. 1 TDDDG). Eine Übersicht
              der lokal in deinem Browser gespeicherten Werte findest du in Abschnitt 9.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">3. Hosting</h2>
            <p className="mt-2">
              Diese Website wird bei <strong>Vercel Inc.</strong> (340 S Lemon Ave #4133, Walnut,
              CA 91789, USA) gehostet. Beim Aufruf der Website werden automatisch
              Server-Log-Dateien erstellt (u. a. IP-Adresse, Datum/Uhrzeit, aufgerufene Seite,
              Browsertyp), die technisch zur Auslieferung der Seite erforderlich sind (Art. 6
              Abs. 1 lit. f DSGVO). Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung nach
              Art. 28 DSGVO. Soweit dabei Daten in die USA übermittelt werden, erfolgt dies auf
              Grundlage der EU-Standardvertragsklauseln (Art. 46 DSGVO); ergänzend kann sich der
              Anbieter dem EU-US Data Privacy Framework unterworfen haben.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">4. Konten, Anmeldung &amp; Datenbank (Supabase)</h2>
            <p className="mt-2">
              Für Nutzerkonten, Anmeldung und die Speicherung deiner Grow-/Nutzungsdaten setzen
              wir <strong>Supabase</strong> (Backend-as-a-Service, Datenbank und Authentifizierung)
              ein. Zur Aufrechterhaltung deiner Anmeldung werden technisch notwendige Cookies
              bzw. lokale Speicherwerte gesetzt (Art. 6 Abs. 1 lit. b DSGVO). Ohne diese
              Speicherung ist eine Nutzung des Nutzerkontos nicht möglich. Für diese technisch
              notwendigen Cookies ist keine gesonderte Einwilligung erforderlich.
            </p>
            <p className="mt-2">
              Mit dem Anbieter besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO.
              Soweit eine Verarbeitung außerhalb der EU stattfindet, erfolgt diese auf Grundlage
              der EU-Standardvertragsklauseln (Art. 46 DSGVO).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">5. Reichweitenmessung (Plausible Analytics, Vercel Analytics &amp; Speed Insights)</h2>
            <p className="mt-2">
              Wenn du dem zustimmst, nutzen wir den datenschutzfreundlichen Webanalysedienst{" "}
              <strong>Plausible Analytics</strong> sowie <strong>Vercel Analytics</strong> und{" "}
              <strong>Vercel Speed Insights</strong> zur anonymen, aggregierten Auswertung der
              Seitenaufrufe und Ladezeiten. Diese Dienste verzichten auf Cookies, speichern keine
              IP-Adressen dauerhaft und erstellen keine individuellen Nutzerprofile. Sie werden erst
              geladen, nachdem du im Cookie-Hinweis auf „Alle akzeptieren&quot; geklickt hast (Art. 6
              Abs. 1 lit. a DSGVO); wählst du „Nur notwendige&quot;, werden sie nicht geladen. Deine
              Auswahl speichern wir zusammen mit Zeitpunkt und Versionsstand lokal in deinem Browser
              (localStorage), damit du nicht bei jedem Besuch erneut gefragt wirst — das ist zur
              Funktion des Hinweises selbst technisch notwendig und erfordert keine gesonderte
              Einwilligung. Du kannst deine Einwilligung jederzeit mit Wirkung für die Zukunft
              widerrufen, indem du im Seitenfuß auf „Cookie-Einstellungen&quot; klickst; nach dem
              Widerruf wird der Hinweis erneut angezeigt. Spätestens nach zwölf Monaten fragen wir
              ohnehin erneut nach. Sendet dein Browser das Signal „Global Privacy Control&quot;
              (GPC), werten wir das als Ablehnung — die Analyse-Tools werden dann ohne weitere
              Nachfrage nicht geladen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">6. Fehlerdiagnose &amp; Stabilität (Sentry)</h2>
            <p className="mt-2">
              Um technische Fehler zu erkennen und zu beheben, setzen wir den Dienst{" "}
              <strong>Sentry</strong> (Functional Software, Inc., 45 Fremont Street, San Francisco,
              CA 94105, USA) ein. Tritt in deinem Browser ein Fehler auf, werden dabei technische
              Informationen (u. a. Fehlermeldung, betroffene Seite, Browser- und Gerätetyp) sowie
              eine datensparsame Aufzeichnung des Seitenzustands im Fehlermoment („Session
              Replay&quot;) an Sentry übermittelt. Sämtliche Texteingaben und Medieninhalte sind
              dabei technisch unkenntlich gemacht (maskiert); eine fortlaufende
              Sitzungsaufzeichnung findet nicht statt. Diese im Browser ausgeführte Fehlerdiagnose
              wird — wie die Reichweitenmessung — erst geladen, nachdem du im Cookie-Hinweis auf
              „Alle akzeptieren&quot; geklickt hast (Art. 6 Abs. 1 lit. a DSGVO); ohne Einwilligung
              bleibt sie vollständig deaktiviert, und ein Widerruf beendet sie.
            </p>
            <p className="mt-2">
              Unabhängig davon protokollieren wir serverseitig Fehler unserer eigenen Anwendung
              ohne Bezug zu deinem Endgerät auf Grundlage unseres berechtigten Interesses an einem
              stabilen und sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO). Mit Sentry besteht ein
              Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO; eine Übermittlung in die USA
              erfolgt auf Grundlage der EU-Standardvertragsklauseln (Art. 46 DSGVO), ergänzend
              kann sich der Anbieter dem EU-US Data Privacy Framework unterworfen haben.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">7. Newsletter (Loops)</h2>
            <p className="mt-2">
              Wenn du dich für unseren Newsletter anmeldest, wird deine E-Mail-Adresse zur
              Versendung von Updates an unseren Versanddienstleister <strong>Loops</strong>{" "}
              (Loops, Inc., USA) übermittelt und dort gespeichert, bis du dich abmeldest.
              Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Mit dem
              Anbieter besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO; die
              Übermittlung in die USA erfolgt auf Grundlage der EU-Standardvertragsklauseln
              (Art. 46 DSGVO). Du kannst deine Einwilligung jederzeit über den Abmeldelink in
              jeder Newsletter-Mail oder per Mail an{" "}
              <a href="mailto:contact@secretleaf.net" className="font-semibold text-[#1f7a4f] hover:text-[#17613f]">
                contact@secretleaf.net
              </a>{" "}
              widerrufen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">8. KI-gestützte Funktionen</h2>
            <p className="mt-2">
              Einzelne Funktionen (z. B. die Diagnose-Hilfe) können ganz oder teilweise
              automatisiert bzw. KI-gestützt arbeiten. Entsprechend gekennzeichnete Ausgaben
              stellen automatisierte Einschätzungen dar und ersetzen keine fachliche oder
              medizinische Beratung.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">9. Übersicht der lokal gespeicherten Daten</h2>
            <p className="mt-2">
              Diese Website speichert die folgenden Werte im lokalen Speicher deines Browsers
              (localStorage / sessionStorage). Es handelt sich nicht um Cookies im klassischen
              Sinne; die Werte werden nicht automatisch an einen Server übertragen.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th className="py-2 pr-4 font-semibold">Bezeichnung</th>
                    <th className="py-2 pr-4 font-semibold">Zweck</th>
                    <th className="py-2 pr-4 font-semibold">Speicherdauer</th>
                    <th className="py-2 font-semibold">Grundlage</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr className="border-b border-border/60">
                    <td className="py-2 pr-4"><code>theme</code></td>
                    <td className="py-2 pr-4">Merkt deine Hell-/Dunkel-Einstellung.</td>
                    <td className="py-2 pr-4">Dauerhaft, bis du sie löschst</td>
                    <td className="py-2">Technisch notwendig (§ 25 Abs. 2 TDDDG)</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="py-2 pr-4"><code>sl-cookie-consent</code></td>
                    <td className="py-2 pr-4">
                      Speichert deine Cookie-Entscheidung inkl. Zeitpunkt und Versionsstand.
                    </td>
                    <td className="py-2 pr-4">Bis zu 12 Monate, dann erneute Abfrage</td>
                    <td className="py-2">
                      Technisch notwendig / Nachweis der Einwilligung (Art. 7 Abs. 1 DSGVO)
                    </td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="py-2 pr-4"><code>sl-cookie-reopen</code></td>
                    <td className="py-2 pr-4">
                      Kurzzeitige Hilfsmarkierung, damit der Hinweis nach einem Widerruf trotz
                      GPC-Signal erneut erscheint.
                    </td>
                    <td className="py-2 pr-4">Ende der Browser-Sitzung</td>
                    <td className="py-2">Technisch notwendig (§ 25 Abs. 2 TDDDG)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><code>sb-…-auth-token</code> (nur mit Konto)</td>
                    <td className="py-2 pr-4">Hält deine Anmeldung aufrecht (Supabase, Abschnitt 4).</td>
                    <td className="py-2 pr-4">Bis zum Abmelden bzw. Ablauf der Sitzung</td>
                    <td className="py-2">Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Die Analyse-Tools (Abschnitt 5) und die Fehlerdiagnose im Browser (Abschnitt 6)
              werden nur nach Einwilligung geladen und setzen selbst keine Cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">10. Deine Rechte</h2>
            <p className="mt-2">Du hast jederzeit das Recht auf:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Auskunft über die von uns verarbeiteten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
            <p className="mt-2">
              Eine erteilte Einwilligung (z. B. in die Reichweitenmessung oder den Newsletter)
              kannst du jederzeit mit Wirkung für die Zukunft widerrufen, ohne dass die
              Rechtmäßigkeit der bis dahin erfolgten Verarbeitung berührt wird.
            </p>
            <p className="mt-2">
              Wende dich dazu einfach an{" "}
              <a href="mailto:contact@secretleaf.net" className="font-semibold text-[#1f7a4f] hover:text-[#17613f]">
                contact@secretleaf.net
              </a>
              . Außerdem hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu
              beschweren.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">11. Aktualität</h2>
            <p className="mt-2">
              Diese Datenschutzerklärung wird bei Änderungen unserer Datenverarbeitung
              entsprechend aktualisiert. Es gilt jeweils die auf dieser Seite abrufbare aktuelle
              Fassung.
            </p>
            <p className="mt-2 text-muted-fg">Stand: August 2026</p>
          </section>
        </div>
      </section>
    </main>
  );
}
