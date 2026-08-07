'use client';

import { useState } from 'react';
import { Analytics } from '@/lib/analytics';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (res.ok) {
        Analytics.newsletterSignup();
        setStatus('success');
      } else {
        const data = await res.json() as { error?: string };
        setErrorMsg(data.error ?? 'Etwas ist schiefgelaufen.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Keine Verbindung. Bitte versuche es erneut.');
      setStatus('error');
    }
  };

  return (
    <section className="border-t border-border bg-gradient-to-br from-emerald-950/8 to-card">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-bold text-emerald-700 tracking-widest uppercase mb-4">
            <Mail className="h-3 w-3" strokeWidth={2} /> Wöchentliche Zusammenfassung
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Jede Woche das Wichtigste
          </h2>
          <p className="mt-3 text-sm text-muted-fg leading-relaxed">
            Neue Studien, Top-Anbau-Wissen und aktuelle Erkenntnisse – kompakt zusammengefasst.
            Kein Spam, jederzeit abmeldbar.
          </p>

          {status === 'success' ? (
            <div className="mt-6 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" strokeWidth={2} /> Du bist dabei! Wir benachrichtigen dich bei neuen Updates.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground
                  placeholder:text-muted-fg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100
                  transition-[border-color,box-shadow] duration-150"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white
                  hover:bg-emerald-500 transition-[transform,background-color,opacity] duration-150 shadow-sm flex-shrink-0
                  active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
              >
              {status === 'loading' ? 'Wird übermittelt…' : 'Abonnieren'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-2 text-xs text-red-500">{errorMsg ?? 'Etwas ist schiefgelaufen. Bitte versuche es erneut.'}</p>
          )}

          <div className="mt-5 flex flex-wrap justify-center gap-5 text-[11px] text-muted-fg">
            {[
              'Wöchentlich, kein Spam',
              'Neue Top-Studien',
              'Jederzeit abmeldbar',
            ].map(item => (
              <span key={item} className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 flex-shrink-0" strokeWidth={2} /> {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
