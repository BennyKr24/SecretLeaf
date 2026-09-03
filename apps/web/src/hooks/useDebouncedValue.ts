"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` delayed by `delayMs`. Rapid changes (a text input being
 * typed into) collapse to a single trailing update, so effects keyed on the
 * debounced value fire once the user pauses instead of per keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
