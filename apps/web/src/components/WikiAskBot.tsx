'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { wikiArticles, categoryLabels } from '@/data/terpira/wiki';
import type { TerpiraArticle } from '@/lib/terpira/types';

// ─── Typen ────────────────────────────────────────────────────────────────────

type MessageSource = { title: string; slug: string; category: string };

type Message = {
  id: string;
  role: 'user' | 'bot';
  text: string;
    sources?: MessageSource[] | undefined;
  thinking?: boolean;
};

type ScoredArticle = { article: TerpiraArticle; score: number };

// ─── Mini-Suchmaschine (client-only, keine externe API) ───────────────────────

const UMLAUT: Record<string, string> = {
  ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss',
  Ä: 'ae', Ö: 'oe', Ü: 'ue',
};

const STOP = new Set([
  'und', 'der', 'die', 'das', 'ein', 'eine', 'in', 'an', 'auf', 'fur', 'fuer',
  'mit', 'von', 'zu', 'wie', 'was', 'ist', 'auch', 'bei', 'the', 'and', 'of',
  'a', 'to', 'for', 'is', 'what', 'how', 'does', 'do', 'er', 'sie', 'es',
]);

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äöüßÄÖÜ]/g, c => UMLAUT[c] ?? c)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tok(s: string): string[] {
  return norm(s)
    .split(' ')
    .filter(t => t.length >= 3 && !STOP.has(t));
}

function scoreArticle(article: TerpiraArticle, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  let score = 0;

  const fields: [string, number][] = [
    [article.title, 12],
    [article.tags.join(' '), 6],
    [article.summary, 5],
    [article.keyTakeaways.join(' '), 4],
    [article.sections.flatMap(s => [s.heading, ...s.content]).join(' '), 2],
    [(article.faq ?? []).flatMap(f => [f.question, f.answer]).join(' '), 2],
    [(article.glossary ?? []).flatMap(g => [g.term, g.definition]).join(' '), 1],
    [(article.simpleExplainers ?? []).map(e => e.text).join(' '), 1],
  ];

  for (const [text, weight] of fields) {
    const n = norm(text);
    for (const qt of tokens) {
      if (n.includes(qt)) score += weight * (qt.length >= 6 ? 2 : 1);
      else if (n.split(' ').some(t => t.startsWith(qt))) score += weight * 0.6;
    }
  }
  return score;
}

function findArticles(query: string, limit = 4): ScoredArticle[] {
  const tokens = tok(query);
  if (tokens.length === 0) return [];

  return wikiArticles
    .map(article => ({ article, score: scoreArticle(article, tokens) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function synthesizeAnswer(query: string, results: ScoredArticle[]): string {
  if (results.length === 0) {
    return (
      'Zu dieser Frage habe ich keinen passenden Artikel im Wiki gefunden. ' +
      'Versuche es mit einem anderen Suchbegriff oder nutze die Volltextsuche (Strg+K) über alle Artikel, Glossar und Quellen.'
    );
  }

  const { article } = results[0]!;
  const lines: string[] = [];

  lines.push(article.summary);
  lines.push('');

  if (article.keyTakeaways.length > 0) {
    lines.push('**Kernpunkte:**');
    for (const kp of article.keyTakeaways.slice(0, 3)) {
      lines.push(`• ${kp}`);
    }
    lines.push('');
  }

  // FAQ-Treffer suchen
  const queryNorm = norm(query);
  const faqMatch = (article.faq ?? []).find(f =>
    tok(query).some(t => norm(f.question).includes(t) || norm(f.answer).includes(t))
  );
  if (faqMatch) {
    lines.push(`**Häufige Frage:** ${faqMatch.question}`);
    lines.push(faqMatch.answer);
    lines.push('');
  }

  // Simpleexplainer
  const explainer = article.simpleExplainers?.[0];
  if (explainer && !faqMatch && queryNorm.split(' ').length <= 4) {
    lines.push(`**${explainer.title}**`);
    lines.push(explainer.text);
  }

  return lines.join('\n').trim();
}

// ─── Antwort-Renderer ─────────────────────────────────────────────────────────

function RenderAnswer({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-6 text-foreground/80">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={i} className="font-semibold text-foreground mt-2">
              {line.slice(2, -2)}
            </p>
          );
        }
        if (line.startsWith('• ')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-emerald-500 font-bold flex-shrink-0">•</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        }
        if (line.startsWith('**') && line.includes('**')) {
          const rendered = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
          return (
            <p key={i} dangerouslySetInnerHTML={{ __html: rendered }} />
          );
        }
        if (line === '') return <div key={i} className="h-1" />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

// ─── Starter-Fragen ───────────────────────────────────────────────────────────

const SUGGESTED: Array<{ label: string; q: string }> = [
  { label: 'Was ist VPD?', q: 'Was ist VPD und welchen Einfluss hat es auf Cannabis?' },
  { label: 'CBD vs. THC', q: 'Worin unterscheiden sich CBD und THC?' },
  { label: 'Terpene erklärt', q: 'Was sind Terpene und welche Wirkung haben sie?' },
  { label: 'Curing & Wasseraktivität', q: 'Wie funktioniert Curing und was bedeutet Wasseraktivität?' },
  { label: 'Endocannabinoid-System', q: 'Wie wirkt Cannabis über das Endocannabinoid-System?' },
  { label: 'Phänotyp-Selektion', q: 'Was ist ein Pheno-Hunt und warum ist er wichtig?' },
];

// ─── WikiAskBot ───────────────────────────────────────────────────────────────

export default function WikiAskBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useRef(0);

  function nextId(): string {
    uid.current += 1;
    return String(uid.current);
  }

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Escape schließt den Bot
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape' && open) setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const ask = useCallback(async (question: string) => {
    if (!question.trim() || loading) return;

    const userMsg: Message = { id: nextId(), role: 'user', text: question.trim() };
    const thinkMsg: Message = { id: nextId(), role: 'bot', text: '', thinking: true };

    setMessages(prev => [...prev, userMsg, thinkMsg]);
    setInput('');
    setLoading(true);

    // Simuliertes "Nachdenken" – 600–900ms
    const delay = 600 + Math.random() * 300;
    await new Promise(resolve => setTimeout(resolve, delay));

    const results = findArticles(question, 4);
    const answerText = synthesizeAnswer(question, results);

    const sources: MessageSource[] = results.slice(0, 3).map(r => ({
      title: r.article.title,
      slug: r.article.slug,
      category: categoryLabels[r.article.category] ?? r.article.category,
    }));

    const botMsg: Message = {
      id: nextId(),
      role: 'bot',
      text: answerText,
        ...(sources.length > 0 ? { sources } : {}),
    };

    setMessages(prev => [...prev.slice(0, -1), botMsg]);
    setLoading(false);
  }, [loading]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(input);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void ask(input);
    }
  }

  function reset() {
    setMessages([]);
    setInput('');
  }

  return (
    <>
      {/* ── Floating Trigger ──────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Wiki-Bot öffnen"
        className={`
          fixed bottom-6 right-6 z-50 flex items-center gap-2
          rounded-full px-4 py-3 shadow-xl transition-all duration-300
          bg-primary text-white hover:bg-primary-dark hover:shadow-2xl
          hover:scale-105 active:scale-95
          ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="text-sm font-semibold">Wiki-Bot</span>
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
      </button>

      {/* ── Panel Overlay ─────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-end p-4 sm:p-6"
          role="dialog" aria-modal aria-label="Wiki-Bot">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative flex flex-col w-full max-w-md h-[85vh] max-h-[640px]
            rounded-2xl bg-card shadow-2xl border border-border overflow-hidden
            animate-in slide-in-from-bottom-8 duration-300 ease-out">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4
              bg-gradient-to-r from-primary-deep to-primary text-white flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-card/20 flex items-center justify-center text-base">
                  🤖
                </div>
                <div>
                  <p className="font-bold text-sm">Wiki-Bot</p>
                  <p className="text-xs text-emerald-200">Auf Basis von {wikiArticles.length} Artikeln</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button onClick={reset}
                    className="text-xs text-white/60 hover:text-white px-2 py-1 rounded-lg hover:bg-card/10 transition">
                    Zurücksetzen
                  </button>
                )}
                <button onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-card/10 transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-background/50">
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
                    <p className="text-sm text-foreground/80">
                      Hallo! Ich bin der <strong className="text-foreground">Wiki-Bot</strong>.
                      Frag mich alles rund um Cannabis – ich durchsuche
                      alle {wikiArticles.length} Artikel für dich und fasse die wichtigsten
                      Punkte zusammen.
                    </p>
                    <p className="mt-2 text-xs text-muted-fg">
                      Läuft vollständig lokal · keine Daten verlassen deinen Browser
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-fg uppercase tracking-wider px-1 mb-2">
                      Schnellstart
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {SUGGESTED.map(s => (
                        <button
                          key={s.q}
                          onClick={() => void ask(s.q)}
                          className="text-left rounded-xl border border-border bg-card px-3 py-2.5
                            text-xs text-foreground hover:border-emerald-300 hover:bg-emerald-50
                            hover:text-emerald-800 transition-all shadow-sm"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-emerald-400
                        flex-shrink-0 flex items-center justify-center text-xs text-white mr-2 mt-1">
                        🌿
                      </div>
                    )}

                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'max-w-[75%]' : ''}`}>
                      {msg.thinking ? (
                        <div className="rounded-2xl rounded-tl-sm bg-card border border-border
                          shadow-sm px-4 py-3 flex items-center gap-2">
                          <span className="flex gap-1">
                            {[0, 1, 2].map(i => (
                              <span key={i}
                                className="w-1.5 h-1.5 rounded-full bg-muted-fg animate-bounce"
                                style={{ animationDelay: `${i * 150}ms` }}
                              />
                            ))}
                          </span>
                          <span className="text-xs text-muted-fg">Durchsuche Wiki…</span>
                        </div>
                      ) : msg.role === 'user' ? (
                        <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5
                          text-sm text-white shadow-sm">
                          {msg.text}
                        </div>
                      ) : (
                        <div className="space-y-2">
                        <div className="rounded-2xl rounded-tl-sm bg-card border border-border
                            shadow-sm px-4 py-3">
                            <RenderAnswer text={msg.text} />
                          </div>
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="px-1 space-y-1">
                              <p className="text-xs text-muted-fg font-medium">Artikel dazu:</p>
                              {msg.sources.map(src => (
                                <Link
                                  key={src.slug}
                                    href={`/studies/${src.slug}` as Route}
                                  onClick={() => setOpen(false)}
                                  className="flex items-start gap-2 rounded-lg border border-border
                                    bg-card px-3 py-2 text-xs hover:border-emerald-300
                                    hover:bg-emerald-50 transition-all"
                                >
                                  <span className="text-emerald-500 mt-0.5">→</span>
                                  <div>
                                    <p className="font-semibold text-foreground">{src.title}</p>
                                    <p className="text-muted-fg">{src.category}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-border bg-card px-4 py-3">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Frag das Wiki…"
                  disabled={loading}
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5
                    text-sm text-foreground placeholder:text-muted-fg outline-none
                    focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all
                    disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-primary text-white flex items-center
                    justify-center hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              <p className="mt-1.5 text-center text-xs text-muted-fg">
                Inhalte dienen der Information · kein Ersatz für medizinischen Rat
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
