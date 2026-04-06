import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import type { Route } from "next";
import SearchBar from "@/components/SearchBar";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "SecretLeaf",
  description: "Privacy-first Cannabis-Plattform mit Studies, Tools, Database, Dashboard und Suche"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-[#10281e] text-base flex-shrink-0">
              <span className="text-xl">🌿</span>
              <span className="hidden sm:inline">SecretLeaf</span>
            </Link>

            {/* Primary Navigation */}
            <div className="hidden md:flex items-center gap-1 text-sm text-slate-600">
              <Link href={"/studies" as Route} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition font-medium">
                Studies
              </Link>
              <Link href={"/tools" as Route} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition font-medium">
                Tools
              </Link>
              <Link href={"/database" as Route} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition font-medium">
                Database
              </Link>
              <Link href={"/dashboard" as Route} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition font-medium">
                Dashboard
              </Link>
              <Link href={"/search" as Route} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition font-medium">
                Search
              </Link>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* SearchBar */}
            <SearchBar />

            <Link
              href={"/status" as Route}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
            >
              Status
            </Link>

            {/* Secondary Navigation */}
            <Link
              href={"/auth" as Route}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
            >
              Anmelden
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
