'use client';

import { useEffect } from 'react';
import { useReadingHistory } from '@/hooks/useReadingHistory';

type Props = {
  slug: string;
  title: string;
  category: string;
};

/** Silently adds the current article to reading history on mount */
export default function HistoryTracker({ slug, title, category }: Props) {
  const { addEntry } = useReadingHistory();

  useEffect(() => {
    addEntry({ slug, title, category });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return null;
}
