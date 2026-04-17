import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import type { Route } from "next";
import SearchBar from "@/components/SearchBar";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "SecretLeaf – Cannabis Intelligence Platform",
  description: "Die führende Wissensplattform für evidenzbasiertes Cannabis-Wissen. 82+ Fachartikel, 300+ peer-reviewed Quellen."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>

        {/* ── Top trust bar ───────────────────────────────────────── */}
        <div className="hidden md:flex items-center justify-center gap-6 border-b border-slate-100 bg-slate-50/80 px-5 py-1.5">
          {[
            { icon: '✓', text: 'Peer-reviewed Quellen' },
            { icon: '🔬', text: 'Evidenzbasiert' },
            { icon: '↻', text: 'Regelmäßig aktualisiert' },
            { icon: '🛡', text: 'Verifizierte Inhalte' },
          ].map(item => (
            <span key={item.text} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="text-emerald-600">{item.icon}</span>
              {item.text}
            </span>
          ))}
        </div>

        {/* ── Main navigation ─────────────────────────────────────── */}
        <nav className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-5 h-[60px] flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-slate-900 text-[15px] flex-shrink-0 tracking-tight group">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-sm transition-transform duration-200 group-hover:scale-110">🌿</span>
              <span className="hidden sm:inline">SecretLeaf</span>
            </Link>

            {/* Divider */}
            <div className="hidden md:block h-5 w-px bg-slate-200" />

            {/* Primary Navigation */}
            <div className="hidden md:flex items-center gap-0.5 text-[13.5px] text-slate-600">
              <Link href={"/studies" as Route} className="nav-link px-3 py-1.5 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors duration-150 font-medium">
                Studien
              </Link>
              <Link href={"/database" as Route} className="nav-link px-3 py-1.5 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors duration-150 font-medium">
                Datenbank
              </Link>
              <Link href={"/tools" as Route} className="nav-link px-3 py-1.5 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors duration-150 font-medium">
                Tools
              </Link>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* SearchBar */}
            <SearchBar />

            <Link
              href={"/dashboard" as Route}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[13.5px] font-medium text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors duration-150"
            >
              Dashboard
            </Link>

            <Link
              href={"/auth" as Route}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[13.5px] font-semibold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-150 shadow-sm"
            >
              Anmelden
            </Link>
          </div>
        </nav>
        {children}

        {/* ── Footer ──────────────────────────────────────────────── */}
        <footer className="border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-sm">🌿</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">SecretLeaf</p>
                  <p className="text-[11px] text-slate-400">Cannabis Intelligence Platform</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-slate-500">
                <Link href={"/studies" as Route} className="hover:text-emerald-600 transition-colors">Studien</Link>
                <Link href={"/database" as Route} className="hover:text-emerald-600 transition-colors">Datenbank</Link>
                <Link href={"/tools" as Route} className="hover:text-emerald-600 transition-colors">Tools</Link>
                <Link href={"/studies/sources" as Route} className="hover:text-emerald-600 transition-colors">Quellenregister</Link>
              </div>
              <p className="text-[11px] text-slate-400">
                © {new Date().getFullYear()} SecretLeaf · Alle Rechte vorbehalten
              </p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
