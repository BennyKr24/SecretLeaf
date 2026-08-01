'use client';

import { useEffect } from 'react';
import { Analytics } from '@/lib/analytics';

type WikiArticleOpenTrackerProps = {
  slug: string;
};

export function WikiArticleOpenTracker({ slug }: WikiArticleOpenTrackerProps) {
  useEffect(() => {
    Analytics.wikiArticleOpened(slug);
  }, [slug]);

  return null;
}