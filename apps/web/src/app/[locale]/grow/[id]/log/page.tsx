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

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
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
  LogEntryData,
  LogEntry,
  TrainingMethod,
} from '@/lib/grow/types';
import { getInsightsForLogType } from '@/lib/grow/insights';
import type { GrowInsight } from '@/lib/grow/insights';
import { Analytics } from '@/lib/analytics';

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

const STREAK_MILESTONES = new Set([3, 7, 14, 21, 30]);

function streakNarrative(streak: number): string {
  if (streak >= 30) return '30 Tage Ertrag geschützt — kein Tag verloren.';
  if (streak >= 21) return `${streak} Tage ohne Ertragsverlust.`;
  if (streak >= 14) return `${streak} Tage — dein Grow verliert keinen Ertrag mehr.`;
  if (streak >= 7)  return `${streak} Tage Ertrag geschützt.`;
  if (streak >= 3)  return 'Ertrag wird täglich geschützt.';
  if (streak >= 1)  return 'Tag 1 — schütze deinen Ertrag täglich.';
  return '';
}

/** Streak pill — shown prominently at the top. */
function StreakBadge({ streak, pulse }: { streak: number; pulse: boolean }) {
  const isMilestone = STREAK_MILESTONES.has(streak);
  const narrative = streakNarrative(streak);

  if (streak === 0) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-500 transition-all duration-300 ${pulse ? 'scale-110 border-emerald-300 bg-emerald-50 text-emerald-700' : ''}`}>
        <span>{pulse ? '🔥' : '🌱'}</span>
        <span className="hidden sm:inline">{pulse ? '1 Tag gestartet!' : 'Noch kein Streak'}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-end rounded-2xl border px-3 py-1.5 text-right transition-all duration-300 ${
      isMilestone && pulse
        ? 'scale-110 border-amber-400 bg-amber-500 text-white shadow-lg shadow-amber-900/25'
        : pulse
        ? 'scale-110 border-emerald-400 bg-emerald-500 text-white shadow-md shadow-emerald-900/20'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
    }`}>
      <span className="text-sm font-black leading-tight">
        {isMilestone && pulse ? '🏆' : '🔥'} {streak} {streak === 1 ? 'Tag' : 'Tage'} Ertrag geschützt
      </span>
      {narrative && (
        <span className={`text-[10px] font-bold leading-tight ${
          (isMilestone && pulse) || pulse ? 'text-white/80' : 'text-emerald-500'
        }`}>
          {narrative}
        </span>
      )}
    </div>
  );
}

// ── Reward messages per log type ─────────────────────────────────────────────
const LOG_SAVE_REWARD: Record<LogEntryType, { headline: string; sub: string; yieldLine: string }> = {
  wasser:      { headline: 'Du hast Trockenstress vermieden ✓',              sub: '+2–4g Ertrag geschützt.',                         yieldLine: 'Dein Grow bleibt im Wachstumsrhythmus.' },
  duenger:     { headline: 'Gut reagiert — Nährstoffmangel vermieden ✓',    sub: '+3–6g Ertrag stabilisiert.',                      yieldLine: 'Dein Grow ist jetzt ausgeglichen.' },
  training:    { headline: 'Guter Schritt — mehr Lichtfläche geschaffen ✓',  sub: '+5–10g mehr Ertrag ermöglicht.',              yieldLine: 'Dein Grow hat jetzt mehr Licht.' },
  notiz:       { headline: 'Du hast deinen Grow dokumentiert ✓',            sub: 'Bessere Grundlage für die nächste Entscheidung.',  yieldLine: 'Jede Notiz macht deinen Grow kalkulierbarer.' },
  tool_result: { headline: 'Du hast ein Problem früh erkannt ✓',            sub: 'Ertragsverlust gestoppt.',                         yieldLine: 'Dein Grow ist jetzt besser kontrolliert.' },
};

/** Inline success banner — slides in below QuickAdd, auto-dismisses. */
function SavedBanner({ type, visible, completedTask }: { type: LogEntryType | null; visible: boolean; completedTask?: string | null }) {
  const reward = type ? LOG_SAVE_REWARD[type] : null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`overflow-hidden transition-all duration-300 ease-out ${
        visible ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      {type && reward && (
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-base text-white shadow-sm">
              ✓
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-emerald-900">{reward.headline}</p>
              <p className="text-xs text-emerald-700 mt-0.5">{reward.sub}</p>
              {completedTask ? (
                <p className="mt-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-lg px-2 py-1 inline-block">
                  ⚡ Kritisches Problem behoben: <span className="font-black">{completedTask}</span>
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] font-bold text-emerald-600">↑ {reward.yieldLine}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Daily completion banner — shown when today is logged and no critical plants. */
function DailyCompletionBanner({ visible, streak }: { visible: boolean; streak: number }) {
  const msg =
    streak >= 14 ? 'Du verhinderst täglich, was andere Grower erst zu spät bemerken.' :
    streak >= 7  ? 'Konsequenz zahlt sich direkt in der Ernte aus.' :
    streak >= 3  ? 'Jeden Tag eintragen ist der wichtigste Faktor für bessere Ernten.' :
                   'Morgen siehst du, ob heute etwas gewirkt hat.';
  return (
    <div
      className={`overflow-hidden transition-all duration-500 ease-out ${
        visible ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3">
        <span className="text-xl leading-none">✅</span>
        <div>
          <p className="text-sm font-black text-emerald-900">Du hast verhindert, dass dein Grow Ertrag verliert ✓</p>
          <p className="text-xs text-emerald-700">{msg}</p>
          <p className="text-[11px] font-bold text-emerald-600 mt-1">→ Morgen entscheidet sich, ob dein Grow stabil bleibt</p>
        </div>
      </div>
    </div>
  );
}

const LOG_ACTION_LABEL: Record<string, string> = {
  wasser:   '💧 Jetzt gießen',
  duenger:  '🧪 Düngung loggen',
  notiz:    '📝 Notiz eintragen',
  training: '✂️ Training loggen',
};

/** Subtle action card — appears after a log entry, dismisses after 8s. */
function LogInsightCard({
  insight,
  growId,
  visible,
  onAct,
}: {
  insight: GrowInsight | null;
  growId: string;
  visible: boolean;
  onAct: () => void;
}) {
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAct = () => {
    setShowFeedback(true);
    setTimeout(onAct, 1600);
  };

  if (!insight) return null;
  const { article, action, priority } = insight;

  const actionHref =
    action.type === 'log' ? `/grow/${growId}/log?type=${action.logType}` : action.href;
  const actionLabel =
    action.type === 'log'
      ? (LOG_ACTION_LABEL[action.logType] ?? 'Jetzt handeln')
      : '🔧 Tool öffnen';

  return (
    <div
      className={`overflow-hidden transition-all duration-500 ease-out ${
        visible ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-base leading-none">💡</span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium leading-snug text-foreground">
              {article.growValue}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Link
                href={actionHref as Route}
                onClick={handleAct}
                className={`rounded-lg px-3 py-1 text-[11px] font-bold text-white transition active:scale-[0.97] ${
                  priority === 'high' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionLabel}
              </Link>
              <Link
                href={`/wiki/${article.slug}` as Route}
                className="text-[11px] font-semibold text-muted-fg hover:underline"
              >
                Details →
              </Link>
            </div>
          </div>
        </div>
        {/* Feedback overlay */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 bg-emerald-500 transition-all duration-300 ${
          showFeedback ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}>
          <p className="text-sm font-black text-white">Du hast ein kritisches Problem behoben ✓</p>
          <p className="text-[11px] font-bold text-emerald-100">Du hast Ertragsverlust gestoppt.</p>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Quick-Add Bar (inline form — no modal)
// ────────────────────────────────────────────────────────────────────────────

type QuickAddProps = {
  activeType: LogEntryType | null;
  plants: { id: string; name: string }[];
  selectedPlantId: string;
  onSelectPlant: (plantId: string) => void;
  onSelect: (type: LogEntryType) => void;
  onCancel: () => void;
  onSave: (type: LogEntryType, fields: Record<string, string>) => void;
  /** When set, form is in edit mode — pre-fill and show "Bearbeiten" label */
  editingEntry?: LogEntry | null;
};

const QUICK_ADD_TYPES: { type: LogEntryType; label: string }[] = [
  { type: 'wasser', label: 'Wasser' },
  { type: 'duenger', label: 'Dünger' },
  { type: 'training', label: 'Training' },
  { type: 'notiz', label: 'Notiz' },
];

function QuickAddBar({
  activeType,
  plants,
  selectedPlantId,
  onSelectPlant,
  onSelect,
  onCancel,
  onSave,
  editingEntry,
}: QuickAddProps) {
  const isEditing = editingEntry != null;

  // Pre-fill fields from existing entry when editing
  const buildInitialFields = useCallback((entry: LogEntry): Record<string, string> => {
    const base: Record<string, string> = {};
    // Date/time — split ISO into date + time parts for the inputs
    const d = new Date(entry.date);
    base['_date'] = d.toISOString().slice(0, 10);
    base['_time'] = d.toTimeString().slice(0, 5);
    if (entry.notes) base['notes'] = entry.notes;
    const { data } = entry;
    if (data.type === 'wasser') {
      if (data.mengeLiter !== undefined) base['mengeLiter'] = String(data.mengeLiter);
      if (data.ph !== undefined) base['ph'] = String(data.ph);
    } else if (data.type === 'duenger') {
      if (data.produkt) base['produkt'] = data.produkt;
      if (data.ec !== undefined) base['ec'] = String(data.ec);
      if (data.mengeLiter !== undefined) base['mengeLiter'] = String(data.mengeLiter);
    } else if (data.type === 'training') {
      base['methode'] = data.methode;
    } else if (data.type === 'notiz') {
      base['text'] = data.text;
    }
    return base;
  }, []);

  const todayDate = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [fields, setFields] = useState<Record<string, string>>(() => {
    if (editingEntry) return buildInitialFields(editingEntry);
    return { _date: todayDate, _time: nowTime };
  });

  const set = useCallback((key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = () => {
    if (!activeType) return;
    onSave(activeType, fields);
    setFields({ _date: todayDate, _time: nowTime });
  };

  return (
    <div className={`rounded-2xl border bg-white p-4 ${isEditing ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'}`}>
      {isEditing && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2">
          <span className="text-sm">✏️</span>
          <p className="text-xs font-bold text-amber-800">Eintrag bearbeiten</p>
        </div>
      )}

      {/* Plant scope selector */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Gültigkeit
        </label>
        <select
          value={selectedPlantId}
          onChange={(e) => onSelectPlant(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Gesamter Grow</option>
          {plants.map((plant) => (
            <option key={plant.id} value={plant.id}>
              {plant.name}
            </option>
          ))}
        </select>
      </div>

      {/* Type selector row — locked in edit mode */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {QUICK_ADD_TYPES.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => {
              if (isEditing) return; // type is fixed when editing
              setFields({ _date: todayDate, _time: nowTime });
              onSelect(type);
            }}
            disabled={isEditing && activeType !== type}
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              activeType === type
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/20'
                : isEditing
                ? 'border border-slate-100 bg-slate-50 text-slate-300'
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

          {/* Date + time row */}
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Datum
              </label>
              <input
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={fields['_date'] ?? todayDate}
                onChange={(e) => set('_date', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Uhrzeit <span className="font-normal normal-case text-slate-300">(optional)</span>
              </label>
              <input
                type="time"
                value={fields['_time'] ?? ''}
                onChange={(e) => set('_time', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Action row */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] ${
                isEditing
                  ? 'bg-amber-500 shadow-amber-900/20 hover:bg-amber-600'
                  : 'bg-emerald-600 shadow-emerald-900/20 hover:bg-emerald-700'
              }`}
            >
              {isEditing ? '✏️ Änderungen speichern' : `${LOG_ENTRY_TYPE_ICONS[activeType]} Eintrag speichern`}
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
  plantName,
  onDelete,
  onEdit,
  isNew,
}: {
  entry: LogEntry;
  plantName?: string | undefined;
  onDelete: (id: string) => void;
  onEdit: (entry: LogEntry) => void;
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
        <p className="mt-0.5 text-[11px] font-semibold text-emerald-700">
          {plantName ?? 'Gesamter Grow'}
        </p>
        <p className="mt-0.5 text-sm font-medium leading-snug text-slate-800">{summary}</p>
        {entry.notes && (
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{entry.notes}</p>
        )}
      </div>

      {/* Time + actions */}
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
          <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
            {/* Edit */}
            <button
              onClick={() => onEdit(entry)}
              className="rounded-lg p-1 text-slate-300 hover:bg-amber-50 hover:text-amber-500"
              aria-label="Eintrag bearbeiten"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            {/* Delete */}
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg p-1 text-slate-300 hover:bg-slate-50 hover:text-slate-500"
              aria-label="Eintrag löschen"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export default function GrowLogPage({}: Props) {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { grows, loaded: growLoaded } = useGrowState();
  const grow = grows.find((g) => g.id === id) ?? null;
  const { entries, loaded: logLoaded, addEntry, deleteEntry, updateEntry, currentStreak, entriesByPlant } = useGrowLog(id);

  const initPlant = searchParams.get('plant') ?? '';
  const [activeType, setActiveType] = useState<LogEntryType | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string>(initPlant);
  const [activePlantFilter, setActivePlantFilter] = useState<string | null>(initPlant || null);
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [savedType, setSavedType] = useState<LogEntryType | null>(null);
  const [completedTask, setCompletedTask] = useState<string | null>(null);
  const [newestId, setNewestId] = useState<string | null>(null);
  const [streakPulse, setStreakPulse] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [logInsightType, setLogInsightType] = useState<LogEntryType | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive: has the user logged today and there are no critical plants?
  const hasTodayEntry = entries.some((e) => {
    const d = new Date(e.date);
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  });
  const noCriticalPlants = grow
    ? grow.plants.every((p) => {
        const pe = entries.filter((e) => e.plantId === p.id);
        if (pe.length === 0) return true;
        const sinceLog = Math.floor((new Date().getTime() - new Date(pe[0]!.date).getTime()) / 86_400_000);
        return sinceLog <= 3;
      })
    : true;

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

  // Show completion banner 600ms after save, hide after 4s
  useEffect(() => {
    if (!hasTodayEntry || !noCriticalPlants) {
      const reset = setTimeout(() => setShowCompletion(false), 0);
      return () => clearTimeout(reset);
    }
    const t = setTimeout(() => setShowCompletion(true), 600);
    if (completionTimer.current) clearTimeout(completionTimer.current);
    completionTimer.current = setTimeout(() => setShowCompletion(false), 5000);
    return () => { clearTimeout(t); if (completionTimer.current) clearTimeout(completionTimer.current); };
  }, [hasTodayEntry, noCriticalPlants]);

  // Dismiss log insight after 8s
  useEffect(() => {
    if (!logInsightType) return;
    if (insightTimer.current) clearTimeout(insightTimer.current);
    insightTimer.current = setTimeout(() => setLogInsightType(null), 8000);
    return () => { if (insightTimer.current) clearTimeout(insightTimer.current); };
  }, [logInsightType]);

  // Resolve insight article for the last logged type
  const insightData = useMemo(
    () => (logInsightType ? (getInsightsForLogType(logInsightType, 1)[0] ?? null) : null),
    [logInsightType],
  );

  /** Builds an ISO date string from the _date / _time fields. */
  const buildDate = (fields: Record<string, string>): string => {
    const datePart = fields['_date'] ?? new Date().toISOString().slice(0, 10);
    const timePart = fields['_time'] ?? new Date().toTimeString().slice(0, 5);
    return new Date(`${datePart}T${timePart}:00`).toISOString();
  };

  /** Builds the LogEntryData from form fields for a given type. */
  const buildData = (type: LogEntryType, fields: Record<string, string>): LogEntryData | null => {
    if (type === 'wasser') {
      const payload: { type: 'wasser'; mengeLiter?: number; ph?: number } = { type: 'wasser' };
      if (fields['mengeLiter']) payload.mengeLiter = parseFloat(fields['mengeLiter']);
      if (fields['ph']) payload.ph = parseFloat(fields['ph']);
      return payload;
    }
    if (type === 'duenger') {
      const payload: { type: 'duenger'; produkt?: string; ec?: number; mengeLiter?: number } = { type: 'duenger' };
      if (fields['produkt']) payload.produkt = fields['produkt'];
      if (fields['ec']) payload.ec = parseFloat(fields['ec']);
      if (fields['mengeLiter']) payload.mengeLiter = parseFloat(fields['mengeLiter']);
      return payload;
    }
    if (type === 'training') {
      if (!fields['methode']) return null;
      return { type: 'training', methode: fields['methode'] as TrainingMethod };
    }
    if (type === 'notiz') {
      if (!fields['text']?.trim()) return null;
      return { type: 'notiz', text: fields['text'].trim() };
    }
    return null;
  };

  const handleSave = useCallback(
    (type: LogEntryType, fields: Record<string, string>) => {
      const notes = fields['notes'] ? fields['notes'] : undefined;
      const data = buildData(type, fields);
      if (!data) return;

      const date = buildDate(fields);

      if (editingEntry) {
        // Update existing entry
        updateEntry(editingEntry.id, {
          date,
          data,
          ...(selectedPlantId ? { plantId: selectedPlantId } : {}),
          ...(notes !== undefined && { notes }),
        });
        setEditingEntry(null);
        setActiveType(null);
        setSavedType(type);
      } else {
        // Create new entry
        const result = addEntry({ date, ...(notes !== undefined && { notes }), data, ...(selectedPlantId ? { plantId: selectedPlantId } : {}) });
        Analytics.logEntryAdded(type);
        setActiveType(null);
        setSavedType(type);
        setLogInsightType(type);
        setStreakPulse(true);
        if (result?.completedTaskId) {
          // Find task title for feedback
          const task = grow?.plan.phases.flatMap((p) => p.tasks).find((t) => t.id === result.completedTaskId);
          setCompletedTask(task?.title ?? 'Task erledigt');
          setTimeout(() => setCompletedTask(null), 4000);
        }
        if (result?.entry.id) setNewestId(result.entry.id);
        setTimeout(() => setNewestId(null), 3000);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingEntry, addEntry, updateEntry, selectedPlantId]
  );

  const handleEdit = useCallback((entry: LogEntry) => {
    setEditingEntry(entry);
    setActiveType(entry.data.type as LogEntryType);
    setSelectedPlantId(entry.plantId ?? '');
    // Scroll to top so form is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setEditingEntry, setActiveType, setSelectedPlantId]);

  const handleCancel = useCallback(() => {
    setEditingEntry(null);
    setActiveType(null);
    setSelectedPlantId('');
  }, [setEditingEntry, setActiveType, setSelectedPlantId]);

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

  const plantFilteredEntries = entriesByPlant(activePlantFilter);
  const grouped = groupByDay(plantFilteredEntries);
  const plantNameById = new Map((grow?.plants ?? []).map((plant) => [plant.id, plant.name]));

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
          key={editingEntry?.id ?? 'new'}
          activeType={activeType}
          plants={grow.plants}
          selectedPlantId={selectedPlantId}
          onSelectPlant={setSelectedPlantId}
          onSelect={setActiveType}
          onCancel={handleCancel}
          onSave={handleSave}
          editingEntry={editingEntry}
        />

        {/* ── Save feedback banner ─────────────────────────────────────────── */}
        <SavedBanner type={savedType} visible={savedType !== null} completedTask={completedTask} />
        {/* ── Daily completion ──────────────────────────────────────────────── */}
        <DailyCompletionBanner visible={showCompletion} streak={currentStreak} />
        {/* ── Log insight (context-aware knowledge tip) ────────────────────── */}
        <LogInsightCard
          insight={insightData}
          growId={id}
          visible={logInsightType !== null && activeType === null}
          onAct={() => setLogInsightType(null)}
        />
        {/* ── Plant Filter ─────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActivePlantFilter(null)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              activePlantFilter === null
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setActivePlantFilter('')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              activePlantFilter === ''
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
            }`}
          >
            Gesamter Grow
          </button>
          {grow.plants.map((plant) => (
            <button
              key={plant.id}
              onClick={() => setActivePlantFilter(plant.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                activePlantFilter === plant.id
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
              }`}
            >
              {plant.name}
            </button>
          ))}
        </div>

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
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      plantName={entry.plantId ? plantNameById.get(entry.plantId) : undefined}
                      onDelete={deleteEntry}
                      onEdit={handleEdit}
                      isNew={entry.id === newestId}
                    />
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

