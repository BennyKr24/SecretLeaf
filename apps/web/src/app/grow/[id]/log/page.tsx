'use client';

// ────────────────────────────────────────────────────────────────────────────
// Grow OS — /grow/[id]/log
//
// GL-01: Grow Log Page
// ─ Quick-Add bar (Wasser / Dünger / Training / Notiz)
// ─ Inline form per entry type — no modal, no page reload
// ─ Streak badge (Retention Motor)
// ─ Timeline grouped by calendar date, newest-first
// ────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Route } from 'next';
import { useGrowState } from '@/hooks/useGrowState';
import { useGrowLog } from '@/hooks/useGrowLog';
import {
  LOG_ENTRY_TYPE_ICONS,
  LOG_ENTRY_TYPE_LABELS,
  TRAINING_METHOD_LABELS,
} from '@/lib/grow/types';
import type {
  LogEntryType,
  LogEntry,
  TrainingMethod,
} from '@/lib/grow/types';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

type Props = Record<string, never>;

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/** Formats an ISO date string as a human-readable day label. */
function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const sameDate = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDate(d, today)) return 'Heute';
  if (sameDate(d, yesterday)) return 'Gestern';

  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Groups log entries by calendar day (YYYY-MM-DD), newest groups first. */
function groupByDay(entries: LogEntry[]): { label: string; date: string; entries: LogEntry[] }[] {
  const map = new Map<string, LogEntry[]>();

  for (const entry of entries) {
    const d = new Date(entry.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const existing = map.get(key) ?? [];
    map.set(key, [...existing, entry]);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, dayEntries]) => ({
      label: formatDayLabel(dayEntries[0]?.date ?? date),
      date,
      entries: dayEntries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }));
}

/** Returns a short summary string for a log entry. */
function entrySummary(entry: LogEntry): string {
  const { data } = entry;
  switch (data.type) {
    case 'wasser': {
      const parts: string[] = [];
      if (data.mengeLiter !== undefined) parts.push(`${data.mengeLiter} L`);
      if (data.ph !== undefined) parts.push(`pH ${data.ph}`);
      return parts.length > 0 ? parts.join(' · ') : 'Bewässerung';
    }
    case 'duenger': {
      const parts: string[] = [];
      if (data.produkt) parts.push(data.produkt);
      if (data.ec !== undefined) parts.push(`EC ${data.ec}`);
      if (data.mengeLiter !== undefined) parts.push(`${data.mengeLiter} L`);
      return parts.length > 0 ? parts.join(' · ') : 'Düngung';
    }
    case 'training':
      return TRAINING_METHOD_LABELS[data.methode];
    case 'notiz':
      return data.text.length > 60 ? `${data.text.slice(0, 60)}…` : data.text;
    case 'tool_result':
      return `${data.toolTitle}: ${data.summary}`;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

/** Streak pill — shown prominently at the top. */
function StreakBadge({ streak, pulse }: { streak: number; pulse: boolean }) {
  if (streak === 0) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-500 transition-all duration-300 ${pulse ? 'scale-110 border-emerald-300 bg-emerald-50 text-emerald-700' : ''}`}>
        <span>{pulse ? '🔥' : '🌱'}</span>
        <span className="hidden sm:inline">{pulse ? '1 Tag gestartet!' : 'Noch kein Streak'}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold transition-all duration-300 ${
      pulse
        ? 'scale-110 border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-900/20'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
    }`}>
      <span className="text-base">🔥</span>
      <span>{streak} {streak === 1 ? 'Tag' : 'Tage'} in Folge{pulse ? ' ↑' : ''}</span>
    </div>
  );
}

/** Inline success banner — slides in below QuickAdd, auto-dismisses. */
function SavedBanner({ type, visible }: { type: LogEntryType | null; visible: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`overflow-hidden transition-all duration-300 ease-out ${
        visible ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      {type && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm text-white">
            ✓
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-800">
              {LOG_ENTRY_TYPE_ICONS[type]} {LOG_ENTRY_TYPE_LABELS[type]} gespeichert
            </p>
            <p className="text-xs text-emerald-600">Gut gemacht — weiter so!</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Quick-Add Bar (inline form — no modal)
// ────────────────────────────────────────────────────────────────────────────

type QuickAddProps = {
  activeType: LogEntryType | null;
  onSelect: (type: LogEntryType) => void;
  onCancel: () => void;
  onSave: (type: LogEntryType, fields: Record<string, string>) => void;
};

const QUICK_ADD_TYPES: { type: LogEntryType; label: string }[] = [
  { type: 'wasser', label: 'Wasser' },
  { type: 'duenger', label: 'Dünger' },
  { type: 'training', label: 'Training' },
  { type: 'notiz', label: 'Notiz' },
];

function QuickAddBar({ activeType, onSelect, onCancel, onSave }: QuickAddProps) {
  const [fields, setFields] = useState<Record<string, string>>({});

  const set = useCallback((key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = () => {
    if (!activeType) return;
    onSave(activeType, fields);
    setFields({});
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      {/* Type selector row */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {QUICK_ADD_TYPES.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => {
              setFields({});
              onSelect(type);
            }}
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              activeType === type
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/20'
                : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            <span>{LOG_ENTRY_TYPE_ICONS[type]}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Inline form */}
      {activeType && (
        <div className="mt-4 space-y-3">
          {activeType === 'wasser' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Menge (Liter)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="z.B. 1.5"
                  value={fields['mengeLiter'] ?? ''}
                  onChange={(e) => set('mengeLiter', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  pH-Wert
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  step="0.1"
                  placeholder="z.B. 6.2"
                  value={fields['ph'] ?? ''}
                  onChange={(e) => set('ph', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          )}

          {activeType === 'duenger' && (
            <>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Produkt
                </label>
                <input
                  type="text"
                  placeholder="z.B. BioBizz Grow"
                  value={fields['produkt'] ?? ''}
                  onChange={(e) => set('produkt', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    EC (mS/cm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="z.B. 1.4"
                    value={fields['ec'] ?? ''}
                    onChange={(e) => set('ec', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Menge (Liter)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="z.B. 2.0"
                    value={fields['mengeLiter'] ?? ''}
                    onChange={(e) => set('mengeLiter', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </>
          )}

          {activeType === 'training' && (
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Methode
              </label>
              <select
                value={fields['methode'] ?? ''}
                onChange={(e) => set('methode', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Methode wählen …</option>
                {(Object.entries(TRAINING_METHOD_LABELS) as [TrainingMethod, string][]).map(
                  ([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {activeType === 'notiz' && (
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Notiz
              </label>
              <textarea
                rows={3}
                placeholder="Was ist dir heute aufgefallen?"
                value={fields['text'] ?? ''}
                onChange={(e) => set('text', e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}

          {/* Optional notes field for non-text types */}
          {activeType !== 'notiz' && (
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Zusatznotiz <span className="font-normal normal-case text-slate-300">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Weitere Bemerkungen …"
                value={fields['notes'] ?? ''}
                onChange={(e) => set('notes', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}

          {/* Action row */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-900/20 transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              {LOG_ENTRY_TYPE_ICONS[activeType]} Eintrag speichern
            </button>
            <button
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Timeline Entry Card
// ────────────────────────────────────────────────────────────────────────────

function EntryCard({
  entry,
  onDelete,
  isNew,
}: {
  entry: LogEntry;
  onDelete: (id: string) => void;
  isNew?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const time = new Date(entry.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const icon = LOG_ENTRY_TYPE_ICONS[entry.data.type];
  const label = LOG_ENTRY_TYPE_LABELS[entry.data.type];
  const summary = entrySummary(entry);

  return (
    <div className={`group flex items-start gap-3 rounded-xl border bg-white px-4 py-3 transition-all hover:border-slate-200 ${
      isNew ? 'border-emerald-300 shadow-sm shadow-emerald-100' : 'border-slate-100'
    }`}>
      {/* Icon */}
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-base">
        {icon}
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium leading-snug text-slate-800">{summary}</p>
        {entry.notes && (
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{entry.notes}</p>
        )}
      </div>

      {/* Time + delete */}
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <span className="text-[11px] text-slate-400">{time}</span>
        {confirming ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(entry.id)}
              className="rounded-lg bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 hover:bg-rose-100"
            >
              Löschen
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-lg px-2 py-0.5 text-[10px] font-semibold text-slate-400 hover:bg-slate-50"
            >
              Nein
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="rounded-lg p-1 text-slate-300 opacity-0 transition hover:bg-slate-50 hover:text-slate-500 group-hover:opacity-100"
            aria-label="Eintrag löschen"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export default function GrowLogPage(_props: Props) {
  const { id } = useParams<{ id: string }>();
  const { grows, loaded: growLoaded } = useGrowState();
  const grow = grows.find((g) => g.id === id) ?? null;
  const { entries, loaded: logLoaded, addEntry, deleteEntry, currentStreak } = useGrowLog(id);

  const [activeType, setActiveType] = useState<LogEntryType | null>(null);
  const [savedType, setSavedType] = useState<LogEntryType | null>(null);
  const [newestId, setNewestId] = useState<string | null>(null);
  const [streakPulse, setStreakPulse] = useState(false);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-clear feedback after 3 s
  useEffect(() => {
    if (!savedType) return;
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setSavedType(null), 3000);
    return () => { if (bannerTimer.current) clearTimeout(bannerTimer.current); };
  }, [savedType]);

  // Streak pulse lasts 1.5 s
  useEffect(() => {
    if (!streakPulse) return;
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setStreakPulse(false), 1500);
    return () => { if (pulseTimer.current) clearTimeout(pulseTimer.current); };
  }, [streakPulse]);

  const handleSave = useCallback(
    (type: LogEntryType, fields: Record<string, string>) => {
      const now = new Date().toISOString();
      const notes = fields['notes'] ? fields['notes'] : undefined;
      let saved = false;

      if (type === 'wasser') {
        const payload: { type: 'wasser'; mengeLiter?: number; ph?: number } = { type: 'wasser' };
        if (fields['mengeLiter']) payload.mengeLiter = parseFloat(fields['mengeLiter']);
        if (fields['ph']) payload.ph = parseFloat(fields['ph']);
        addEntry({ date: now, ...(notes !== undefined && { notes }), data: payload });
        saved = true;
      }

      if (type === 'duenger') {
        const payload: { type: 'duenger'; produkt?: string; ec?: number; mengeLiter?: number } = { type: 'duenger' };
        if (fields['produkt']) payload.produkt = fields['produkt'];
        if (fields['ec']) payload.ec = parseFloat(fields['ec']);
        if (fields['mengeLiter']) payload.mengeLiter = parseFloat(fields['mengeLiter']);
        addEntry({ date: now, ...(notes !== undefined && { notes }), data: payload });
        saved = true;
      }

      if (type === 'training') {
        if (!fields['methode']) return;
        addEntry({
          date: now,
          ...(notes !== undefined && { notes }),
          data: {
            type: 'training',
            methode: fields['methode'] as TrainingMethod,
          },
        });
        saved = true;
      }

      if (type === 'notiz') {
        if (!fields['text']?.trim()) return;
        addEntry({
          date: now,
          data: {
            type: 'notiz',
            text: fields['text'].trim(),
          },
        });
        saved = true;
      }

      if (saved) {
        setActiveType(null);
        setSavedType(type);
        setStreakPulse(true);
        // Mark the entry that will appear first in the list
        const firstEntry = entries[0];
        if (firstEntry) setNewestId(firstEntry.id);
        // Clear the newest highlight after 3 s
        setTimeout(() => setNewestId(null), 3000);
      }
    },
    [id, addEntry, entries]
  );

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (!growLoaded || !logLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </main>
    );
  }

  if (!grow) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
        <span className="text-4xl">🌿</span>
        <h1 className="text-lg font-bold text-slate-800">Grow nicht gefunden</h1>
        <Link href="/dashboard/user" className="text-sm font-semibold text-emerald-600 hover:underline">
          Zurück zum Dashboard
        </Link>
      </main>
    );
  }

  const grouped = groupByDay(entries);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href={`/grow/${id}` as Route}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                aria-label="Zurück zum Grow"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Grow Log</p>
                <h1 className="text-base font-bold leading-tight text-slate-900">{grow.name}</h1>
                <p className="text-xs text-slate-400">Tag {grow.currentDay} · {entries.length} Einträge</p>
              </div>
            </div>
            <StreakBadge streak={currentStreak} pulse={streakPulse} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-5 px-4 py-5 sm:px-5">
        {/* ── Quick-Add ────────────────────────────────────────────────────── */}
        <QuickAddBar
          activeType={activeType}
          onSelect={setActiveType}
          onCancel={() => setActiveType(null)}
          onSave={handleSave}
        />

        {/* ── Save feedback banner ─────────────────────────────────────────── */}
        <SavedBanner type={savedType} visible={savedType !== null} />

        {/* ── Timeline ────────────────────────────────────────────────────── */}
        {grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-14 text-center">
            <span className="text-3xl">📋</span>
            <p className="mt-3 text-sm font-semibold text-slate-500">Noch keine Einträge</p>
            <p className="mt-1 text-xs text-slate-400">
              Wähle oben eine Kategorie und speichere deinen ersten Log.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.date}>
                <div className="mb-2 flex items-center gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {group.label}
                  </p>
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[11px] text-slate-300">{group.entries.length}</span>
                </div>
                <div className="space-y-2">
                  {group.entries.map((entry) => (
                    <EntryCard key={entry.id} entry={entry} onDelete={deleteEntry} isNew={entry.id === newestId} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

