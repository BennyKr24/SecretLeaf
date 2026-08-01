'use client';

import { useEffect, useState } from 'react';
import { useReadingProgress } from '@/hooks/useReadingProgress';

type Props = {
  slug?: string;
  title?: string;
  category?: string;
  readMinutes?: number;
};

export default function WikiReadingProgress({ slug, title, category, readMinutes }: Props) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const { updateProgress } = useReadingProgress();

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      const sectionElements = Array.from(document.querySelectorAll<HTMLElement>('[id^="section-"]'));
      const activeSectionId = sectionElements
        .filter((element) => element.offsetTop - 160 <= scrollTop)
        .at(-1)?.id;

      setProgress(pct);
      setVisible(scrollTop > 80);

      if (slug && scrollTop > 48) {
        updateProgress({
          slug,
          progress: pct,
          ...(title ? { title } : {}),
          ...(category ? { category } : {}),
          ...(readMinutes !== undefined ? { readMinutes } : {}),
          ...(activeSectionId ? { lastSectionId: activeSectionId } : {}),
        });
      }
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [category, readMinutes, slug, title, updateProgress]);

  return (
    <div
      className={`fixed top-14 left-0 right-0 z-30 h-0.5 bg-border transition-opacity duration-300 ${
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
