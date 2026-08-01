'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@/lib/analytics';
import type { UpdateCta } from '@/lib/updates';

// ── View Tracker ──────────────────────────────────────────────────────────────
// Unsichtbare Komponente: feuert update_viewed auf Mount.

type ViewTrackerProps = {
  slug: string;
  category: string;
  version: string | null;
  featured: boolean;
};

export function UpdateViewTracker({ slug, category, version, featured }: ViewTrackerProps) {
  useEffect(() => {
    Analytics.updateViewed(slug, category, version, featured);
    // Einmaliges Tracking beim Seitenaufruf — keine deps-Änderungen danach erwartet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

// ── CTA Button ────────────────────────────────────────────────────────────────
// Rendert den Feature-CTA und trackt Klicks.

type CtaButtonProps = {
  cta: UpdateCta;
  slug: string;
  category: string;
};

export function UpdateCtaButton({ cta, slug, category }: CtaButtonProps) {
  const isPrimary = cta.variant !== 'secondary';

  const handleClick = () => {
    Analytics.updateCtaClicked(slug, cta.href, category);
  };

  return (
    <a
      href={cta.href}
      onClick={handleClick}
      className={
        isPrimary
          ? 'inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90'
          : 'inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-foreground'
      }
    >
      {cta.label} →
    </a>
  );
}

// ── Newsletter Block ──────────────────────────────────────────────────────────
// Kompakte, dark-theme-konforme Newsletter-Anmeldung für Update-Detailseiten.
// Verwendet denselben /api/newsletter Endpunkt wie NewsletterSignup.

export function UpdateNewsletterBlock() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (res.ok) {
        Analytics.newsletterSignup();
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 text-center">
        <p className="text-sm font-semibold text-primary">
          ✓ Eingetragen — wir benachrichtigen dich beim nächsten Update.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface px-6 py-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-fg">
        Neue Updates direkt erhalten
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-fg">
        Trag dich ein und erfahre als Erster von neuen Features und Verbesserungen.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deine@email.de"
          required
          disabled={status === 'loading'}
          className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-fg/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex-shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === 'loading' ? '…' : 'Eintragen'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-2 text-xs text-amber-400">
          Etwas ist schiefgelaufen. Bitte versuche es erneut.
        </p>
      )}
    </div>
  );
}
