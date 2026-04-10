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
  description: "Fundiertes Cannabis-Wissen – Studies, Tools, Datenbank und mehr."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        <nav className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-5 h-[60px] flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-slate-900 text-[15px] flex-shrink-0 tracking-tight">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-sm">🌿</span>
              <span className="hidden sm:inline">SecretLeaf</span>
            </Link>

            {/* Divider */}
            <div className="hidden md:block h-5 w-px bg-slate-200" />

            {/* Primary Navigation */}
            <div className="hidden md:flex items-center gap-0.5 text-[13.5px] text-slate-600">
              <Link href={"/studies" as Route} className="px-3 py-1.5 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors duration-150 font-medium">
                Studies
              </Link>
              <Link href={"/database" as Route} className="px-3 py-1.5 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors duration-150 font-medium">
                Database
              </Link>
              <Link href={"/tools" as Route} className="px-3 py-1.5 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors duration-150 font-medium">
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
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-[13.5px] font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-150 shadow-sm"
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
