'use client';

// ────────────────────────────────────────────────────────────────────────────
// SaveGrowBanner — calm, dismissible nudge for anonymous users to create an
// account so their locally-stored grow survives a cleared cache / new device.
// Matches DESIGN_SYSTEM.md §2.4 "Calm Interfaces": one quiet inline card, no
// modal, no aggressive color — consistent with this page's existing "one
// calm hero" layout (see header comment in grow/[id]/page.tsx).
// ────────────────────────────────────────────────────────────────────────────

import { useCallback, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { storage, STORAGE_KEYS } from '@/lib/store';
import { IconChip } from '@/components/ui/IconChip';

export default function SaveGrowBanner() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(
    () => storage.get<boolean>(STORAGE_KEYS.SAVE_GROW_BANNER_DISMISSED) ?? false
  );

  const dismiss = useCallback(() => {
    storage.set(STORAGE_KEYS.SAVE_GROW_BANNER_DISMISSED, true);
    setDismissed(true);
  }, []);

  if (isLoading || user || dismissed) return null;

  return (
    <div className="relative flex flex-col gap-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Hinweis schließen"
        className="absolute right-3 top-3 rounded-lg p-1.5 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors duration-150 sm:static"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-8 sm:pr-0">
        <IconChip icon={AlertTriangle} tone="amber" size="md" />
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            Dieser Grow ist nur auf diesem Gerät gespeichert
          </p>
          <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-300">
            Bei gelöschtem Verlauf oder auf einem anderen Gerät ist er weg. Mit einem kostenlosen Konto bleibt er dauerhaft erhalten.
          </p>
        </div>
      </div>

      <Link
        href={`/auth?mode=register&next=${encodeURIComponent(pathname)}`}
        className="flex-shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors duration-150"
      >
        Kostenloses Konto erstellen
      </Link>
    </div>
  );
}
