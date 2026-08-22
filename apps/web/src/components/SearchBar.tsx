'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

const SearchModal = dynamic(() => import('./SearchModal'), { ssr: false });

/** Event name any component can dispatch to open the global search modal
 *  without duplicating its state/listener (there's exactly one SearchBar
 *  instance, rendered in NavigationBar). Used by e.g. the /studies hub. */
export const OPEN_SEARCH_EVENT = 'secretleaf:open-search';

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('search');

  // Cmd+K / Ctrl+K globaler Shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function onOpenEvent() {
      setOpen(true);
    }
    window.addEventListener(OPEN_SEARCH_EVENT, onOpenEvent);
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, onOpenEvent);
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-background hover:bg-card text-muted-fg hover:text-foreground transition-colors min-w-[200px] text-sm border border-border"
        aria-label={t('label')}
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1 text-left text-muted-fg">{t('placeholder')}</span>
      </button>

      <SearchModal open={open} onClose={handleClose} />
    </>
  );
}
