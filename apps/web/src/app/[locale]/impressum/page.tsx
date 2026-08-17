import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum – SecretLeaf",
  robots: { index: true, follow: true },
};

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="min-h-screen px-6 py-12">
      <section className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/90 p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-foreground">Impressum</h1>

        {locale === "en" && (
          <p className="mt-3 rounded-xl border border-border bg-background p-4 text-sm text-muted-fg">
            This legal notice (&ldquo;Impressum&rdquo;) is provided in German, as required under
            German law (§ 18 Abs. 1 MStV).
          </p>
        )}

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-bold text-foreground">Angaben gemäß § 18 Abs. 1 MStV</h2>
            <p className="mt-2">
              Benjamin Kreb
              <br />
              Am Kreuzstein 21
              <br />
              66994 Dahn
              <br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Kontakt</h2>
            <p className="mt-2">
              E-Mail:{" "}
              <a href="mailto:contact@secretleaf.net" className="font-semibold text-[#1f7a4f] hover:text-[#17613f]">
                contact@secretleaf.net
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Status des Angebots</h2>
            <p className="mt-2">
              SecretLeaf befindet sich aktuell in privater, nicht-gewerblicher Entwicklung ohne
              Umsatzerzielung, Verkauf oder Werbefinanzierung. Es besteht daher aktuell keine
              Pflicht zu weiteren Angaben nach § 5 DDG (u. a. Handelsregister, Umsatzsteuer-ID).
              Sobald sich der Status ändert (z. B. Gewerbeanmeldung, Verkauf von Leistungen,
              Werbefinanzierung), wird dieses Impressum entsprechend erweitert.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Streitschlichtung</h2>
            <p className="mt-2">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
              bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#1f7a4f] hover:text-[#17613f]"
              >
                ec.europa.eu/consumers/odr
              </a>
              . Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor
              einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Haftung für Inhalte</h2>
            <p className="mt-2">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen
              Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir
              als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
              rechtswidrige Tätigkeit hinweisen. Bei Bekanntwerden entsprechender
              Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Haftung für Links</h2>
            <p className="mt-2">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
              keinen Einfluss haben. Für diese fremden Inhalte können wir daher keine Gewähr
              übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
