"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { translate } from "@/lib/translate";
import { Globe } from "lucide-react";

type Status = "idle" | "loading" | "done" | "error";

interface Props {
  /** The original German text to potentially translate. */
  text: string;
  /** Render as a block-level wrapper (default: false = inline). */
  block?: boolean;
  className?: string;
}

/**
 * Shows dynamic content (German) with an on-demand "Translate" button.
 * Only renders the button when the active locale is "en".
 * Falls back to original text silently on error.
 */
export function TranslateButton({ text, block = false, className = "" }: Props) {
  const locale = useLocale();
  const t = useTranslations("translate");
  const [translated, setTranslated] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  // On German locale, just render text — no button needed.
  if (locale !== "en") {
    return block ? <span className={className}>{text}</span> : <>{text}</>;
  }

  const handleTranslate = async () => {
    setStatus("loading");
    try {
      const result = await translate(text, "en");
      setTranslated(result);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const handleReset = () => {
    setTranslated(null);
    setStatus("idle");
  };

  const displayText = translated ?? text;

  return (
    <span className={`relative group ${block ? "block" : "inline"} ${className}`}>
      {displayText}
      <span className="inline-flex items-center gap-1 ml-2 align-middle">
        {status !== "done" ? (
          <button
            onClick={handleTranslate}
            disabled={status === "loading"}
            title={t("button")}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors duration-150 disabled:opacity-50"
          >
            {status === "loading" ? (
              <span className="inline-block h-2.5 w-2.5 rounded-full border border-current border-t-transparent animate-spin" />
            ) : (
              <Globe className="h-2.5 w-2.5" strokeWidth={2} />
            )}
            {status === "loading" ? t("loading") : t("button")}
          </button>
        ) : (
          <button
            onClick={handleReset}
            title={t("showOriginal")}
            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 transition-colors duration-150"
          >
            ↩ {t("showOriginal")}
          </button>
        )}
      </span>
    </span>
  );
}
