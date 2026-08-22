'use client';

import { Search } from 'lucide-react';
import { OPEN_SEARCH_EVENT } from './SearchBar';

type Props = {
  label: string;
  className?: string;
};

/** Opens the site's existing global search modal (rendered once in
 *  NavigationBar via SearchBar) instead of embedding a second search UI. */
export default function OpenSearchButton({ label, className }: Props) {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
      className={className}
    >
      <Search className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
      {label}
    </button>
  );
}
