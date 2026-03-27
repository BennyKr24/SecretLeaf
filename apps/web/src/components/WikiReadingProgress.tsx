'use client';

import { useEffect, useState } from 'react';

type Props = {
  slug?: string;
};

const WIKI_PROGRESS_KEY = 'secretleaf:wiki:progress';

export default function WikiReadingProgress({ slug }: Props) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(pct);
      setVisible(scrollTop > 80);

      if (slug) {
        try {
          const raw = localStorage.getItem(WIKI_PROGRESS_KEY);
          const parsed: Record<string, number> = raw ? JSON.parse(raw) : {};
          const normalized = Math.max(0, Math.min(100, Math.round(pct)));
          parsed[slug] = normalized;
          localStorage.setItem(WIKI_PROGRESS_KEY, JSON.stringify(parsed));
        } catch {
          // Ignore persistence errors in private mode or denied storage.
        }
      }
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [slug]);

  return (
    <div
      className={`fixed top-14 left-0 right-0 z-30 h-0.5 bg-slate-100 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Lesefortschritt"
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
