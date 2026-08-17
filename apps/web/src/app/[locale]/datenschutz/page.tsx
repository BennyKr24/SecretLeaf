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
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">3. Hosting</h2>
            <p className="mt-2">
              Diese Website wird bei <strong>Vercel Inc.</strong> (340 S Lemon Ave #4133, Walnut,
              CA 91789, USA) gehostet. Beim Aufruf der Website werden automatisch
              Server-Log-Dateien erstellt (u. a. IP-Adresse, Datum/Uhrzeit, aufgerufene Seite,
              Browsertyp), die technisch zur Auslieferung der Seite erforderlich sind (Art. 6
              Abs. 1 lit. f DSGVO). Eine Übermittlung in die USA erfolgt auf Grundlage der
              EU-Standardvertragsklauseln bzw. eines gleichwertigen Angemessenheitsbeschlusses.
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
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">5. Reichweitenmessung (Plausible Analytics)</h2>
            <p className="mt-2">
              Wir nutzen den datenschutzfreundlichen Webanalysedienst <strong>Plausible
              Analytics</strong> zur anonymen, aggregierten Auswertung der Seitenaufrufe. Plausible
              verzichtet auf Cookies, speichert keine IP-Adressen dauerhaft und erstellt keine
              individuellen Nutzerprofile. Eine Einwilligung ist daher nach herrschender Auffassung
              nicht erforderlich; die Verarbeitung erfolgt auf Grundlage unseres berechtigten
              Interesses an der bedarfsgerechten Gestaltung unserer Website (Art. 6 Abs. 1 lit. f
              DSGVO).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">6. Newsletter (Loops)</h2>
            <p className="mt-2">
              Wenn du dich für unseren Newsletter anmeldest, wird deine E-Mail-Adresse zur
              Versendung von Updates an unseren Versanddienstleister <strong>Loops</strong>{" "}
              (USA) übermittelt und dort gespeichert, bis du dich abmeldest. Rechtsgrundlage ist
              deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Du kannst deine Einwilligung
              jederzeit über den Abmeldelink in jeder Newsletter-Mail oder per Mail an{" "}
              <a href="mailto:contact@secretleaf.net" className="font-semibold text-[#1f7a4f] hover:text-[#17613f]">
                contact@secretleaf.net
              </a>{" "}
              widerrufen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">7. KI-gestützte Funktionen</h2>
            <p className="mt-2">
              Einzelne Funktionen (z. B. die Diagnose-Hilfe) können ganz oder teilweise
              automatisiert bzw. KI-gestützt arbeiten. Entsprechend gekennzeichnete Ausgaben
              stellen automatisierte Einschätzungen dar und ersetzen keine fachliche oder
              medizinische Beratung.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">8. Deine Rechte</h2>
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
              Wende dich dazu einfach an{" "}
              <a href="mailto:contact@secretleaf.net" className="font-semibold text-[#1f7a4f] hover:text-[#17613f]">
                contact@secretleaf.net
              </a>
              . Außerdem hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu
              beschweren.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">9. Aktualität</h2>
            <p className="mt-2">
              Diese Datenschutzerklärung wird bei Änderungen unserer Datenverarbeitung
              entsprechend aktualisiert. Es gilt jeweils die auf dieser Seite abrufbare aktuelle
              Fassung.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
