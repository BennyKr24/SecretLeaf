'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const SearchModal = dynamic(() => import('./SearchModal'), { ssr: false });

export default function SearchBar() {
  const [open, setOpen] = useState(false);

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

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors min-w-[200px] text-sm"
        aria-label="Suche öffnen (Cmd+K)"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1 text-left text-slate-400">Suchen…</span>
        <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 border border-slate-300 rounded text-[10px] font-mono text-slate-400 bg-white group-hover:border-slate-400">
          ⌘K
        </kbd>
      </button>

      <SearchModal open={open} onClose={handleClose} />
    </>
  );
}
