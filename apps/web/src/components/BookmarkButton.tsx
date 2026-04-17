'use client';

import { useBookmarks } from '@/hooks/useBookmarks';

type Props = {
  slug: string;
  size?: 'sm' | 'md';
  /** Extra classes for the button wrapper */
  className?: string;
};

export default function BookmarkButton({ slug, size = 'md', className = '' }: Props) {
  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(slug);

  const sizeClasses = size === 'sm'
    ? 'h-7 w-7 text-sm'
    : 'h-9 w-9 text-base';

  return (
    <button
      type="button"
      aria-label={saved ? 'Lesezeichen entfernen' : 'Studie speichern'}
      onClick={(e) => {
        e.preventDefault();
        toggle(slug);
      }}
      className={`inline-flex items-center justify-center rounded-lg border transition-all duration-150
        ${saved
          ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
          : 'border-slate-200 bg-white text-slate-400 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50'
        } ${sizeClasses} ${className}`}
    >
      {saved ? (
        /* Filled bookmark */
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 3a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2H5z" />
        </svg>
      ) : (
        /* Outline bookmark */
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3-7 3V5z" />
        </svg>
      )}
    </button>
  );
}
