"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import { Megaphone, X } from "lucide-react";
import type { SiteBannerEntry } from "@/lib/updates";

const DISMISS_PREFIX = "site-banner-dismissed-";

/** Renders the admin-curated site-wide banner (Steuerung → Neuigkeiten,
 *  `updates.banner`). Dismissal is per-banner (keyed by slug) so a new
 *  banner always shows once, even if an earlier one was closed. Starts
 *  hidden (matches SSR, where `localStorage` doesn't exist) and reveals
 *  itself post-mount if the current banner wasn't already dismissed. */
export function SiteBanner({ banner }: { banner: SiteBannerEntry | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!banner) return;
    if (localStorage.getItem(`${DISMISS_PREFIX}${banner.slug}`)) return;
    const t = setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(t);
  }, [banner]);

  if (!banner || !visible) return null;

  const dismiss = () => {
    localStorage.setItem(`${DISMISS_PREFIX}${banner.slug}`, "1");
    setVisible(false);
  };

  return (
    <div
      role="banner"
      className="relative z-50 flex items-center justify-between gap-4 border-b border-primary/20 bg-primary/10 px-5 py-2.5"
    >
      <p className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-foreground">
        <Megaphone className="h-4 w-4 flex-shrink-0 text-primary" strokeWidth={2} />
        <span className="truncate">
          <span className="font-semibold">{banner.title}</span>
          {banner.summary && <span className="text-muted-fg"> — {banner.summary}</span>}
        </span>
      </p>
      <div className="flex flex-shrink-0 items-center gap-2">
        {banner.cta && (
          <Link
            href={banner.cta.href as Route}
            className="rounded-lg border border-primary/30 bg-background px-3 py-1 text-[12px] font-semibold text-primary hover:bg-primary/10"
          >
            {banner.cta.label}
          </Link>
        )}
        <button
          onClick={dismiss}
          aria-label="Schließen"
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-fg hover:bg-primary/10 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
