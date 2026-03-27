'use client';

import { useEffect, useState } from 'react';

type Props = {
  sections: Array<{ heading: string }>;
};

export default function WikiArticleToc({ sections }: Props) {
  const [activeId, setActiveId] = useState('section-1');

  useEffect(() => {
    const ids = sections.map((_, idx) => `section-${idx + 1}`);
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0]!.target.id);
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -65% 0px',
        threshold: [0, 0.25, 0.5, 1],
      }
    );

    for (const node of targets) {
      observer.observe(node);
    }

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
        Inhaltsverzeichnis
      </p>
      <ol className="space-y-1">
        {sections.map((section, idx) => {
          const id = `section-${idx + 1}`;
          const active = activeId === id;
          return (
            <li key={section.heading}>
              <a
                href={`#${id}`}
                className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                  active ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
                }`}
              >
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="line-clamp-1">{section.heading}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
