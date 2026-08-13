'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { loginWithSupabase, registerWithSupabase, saveSession, getSession } from '@/lib/auth';
import AuthInput from '@/components/auth/AuthInput';
import PasswordField from '@/components/auth/PasswordField';
import PasswordStrength, { MIN_PASSWORD_LENGTH } from '@/components/auth/PasswordStrength';
import AuthBenefits from '@/components/auth/AuthBenefits';
import { Lock, Shield, Mail, Gift, Leaf, type LucideIcon } from 'lucide-react';

/** Path users are redirected to after password reset email is sent */
const RESET_REDIRECT_PATH = '/auth/reset';

type Mode = 'login' | 'register' | 'forgot';

function getSafeRedirect(target: string | null): string {
  if (!target || !target.startsWith('/')) {
    return '/dashboard/user';
  }

  return target;
}

/**
 * Maps raw Supabase auth error strings to safe, user-friendly German messages.
 *
 * Security notes:
 * - Login errors always return the same generic credential message to prevent
 *   user enumeration (an attacker cannot tell whether the email or the password
 *   was wrong).
 * - "Email not confirmed" is shown only after a successful login attempt, i.e.
 *   the account already exists and the credentials were correct. Revealing this
 *   is intentional UX — it guides the user to check their inbox without leaking
 *   anything that wasn't already confirmed by the login result.
 * - "User already registered" is shown only during registration and reveals that
 *   the email is taken, which is standard behaviour across SaaS products and
 *   necessary for a good signup UX.
 * - All unrecognised errors fall through to a generic message.
 */
function sanitizeError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('invalid login') || lower.includes('invalid credentials') || lower.includes('wrong password')) {
    return 'E-Mail oder Passwort ist falsch.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Bitte bestätige zuerst deine E-Mail-Adresse.';
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'Ein Konto mit dieser E-Mail-Adresse existiert bereits.';
  }
  if (lower.includes('password') && lower.includes('short')) {
    return 'Das Passwort ist zu kurz. Mindestens 10 Zeichen erforderlich.';
  }
  if (lower.includes('rate limit')) {
    return 'Zu viele Versuche. Bitte warte kurz und versuche es erneut.';
  }
  return 'Etwas ist schiefgelaufen. Bitte versuche es erneut.';
}

const trustItems: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Lock, label: 'SSL-verschlüsselt' },
  { icon: Shield, label: 'Datenschutzkonform' },
  { icon: Mail, label: 'Kein Spam' },
  { icon: Gift, label: 'Kostenlos starten' },
];

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">
      <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <p className="text-sm text-red-600 leading-relaxed">{message}</p>
    </div>
  );
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>(() => {
    const m = searchParams.get('mode');
    if (m === 'register' || m === 'forgot') return m;
    return 'login';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setEmailError(null);
      setPasswordError(null);
      setConfirmError(null);
      setGlobalError(null);
      setInfo(null);
      setTimeout(() => emailRef.current?.focus(), 50);
    }, 0);
    return () => clearTimeout(t);
  }, [mode]);

  useEffect(() => {
    const session = getSession();
    if (session) router.replace('/dashboard/user');
  }, [router]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setPassword('');
    setConfirmPassword('');
  };

  const validateEmail = (v: string): string | null => {
    if (!v.trim()) return 'E-Mail ist erforderlich.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Bitte eine gültige E-Mail-Adresse eingeben.';
    return null;
  };

  const validatePassword = (v: string, forRegister: boolean): string | null => {
    if (!v) return 'Passwort ist erforderlich.';
    if (forRegister && v.length < MIN_PASSWORD_LENGTH) return `Mindestens ${MIN_PASSWORD_LENGTH} Zeichen erforderlich.`;
    return null;
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const ee = validateEmail(email);
    if (ee) { setEmailError(ee); return; }
    setEmailError(null);
    setPending(true);
    try {
      const { getSupabaseBrowserClient } = await import('@/lib/supabaseBrowser');
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}${RESET_REDIRECT_PATH}`,
      });
      setInfo('Wenn ein Konto mit dieser Adresse existiert, haben wir dir einen Link zum Zurücksetzen geschickt.');
    } catch {
      setGlobalError('Etwas ist schiefgelaufen. Bitte versuche es erneut.');
    } finally {
      setPending(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ee = validateEmail(email);
    const pe = validatePassword(password, mode === 'register');
    const ce = mode === 'register' && password !== confirmPassword
      ? 'Passwörter stimmen nicht überein.'
      : null;
    setEmailError(ee);
    setPasswordError(pe);
    setConfirmError(ce);
    if (ee || pe || ce) return;
    setGlobalError(null);
    setInfo(null);
    setPending(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (mode === 'login') {
        await loginWithSupabase({ email: cleanEmail, password });
        const redirectTo = getSafeRedirect(searchParams.get('next'));
        router.push(redirectTo);
      } else {
        const session = await registerWithSupabase({ email: cleanEmail, password });
        if (session) {
          saveSession(session);
          router.push('/dashboard/onboarding');
        } else {
          setInfo('Konto erstellt! Bitte bestätige deine E-Mail-Adresse – danach kannst du dich anmelden.');
          switchMode('login');
        }
      }
    } catch (err) {
      setGlobalError(sanitizeError(err instanceof Error ? err.message : ''));
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-stretch">

      {/* LEFT: Premium hero (desktop only) */}
      <div className="hidden lg:flex w-[44%] flex-shrink-0 flex-col justify-between bg-brand-hero px-12 py-14 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 h-[500px] w-[700px] rounded-full bg-emerald-600/10 blur-[120px]" />
          <div className="absolute left-0 bottom-1/3 h-[300px] w-[400px] rounded-full bg-teal-700/8 blur-[80px]" />
        </div>
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-14">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-base transition-transform [@media(hover:hover)]:group-hover:scale-110">
              <Leaf className="h-4 w-4 text-white" strokeWidth={2} />
            </span>
            <span className="text-lg font-bold text-white tracking-tight">SecretLeaf</span>
          </Link>
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-500 mb-3">Wissensplattform für Cannabis</p>
            <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">
              Fundiertes Wissen,<br />
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">das den Unterschied macht.</span>
            </h2>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
              Wissenschaftliches Cannabis-Wissen aus peer-reviewed Quellen – jetzt mit persönlichem Konto nutzen.
            </p>
          </div>
          <AuthBenefits />
        </div>
        <div className="relative z-10 border-t border-white/5 pt-8">
          <div className="grid grid-cols-2 gap-3">
            {trustItems.map(t => (
              <div key={t.label} className="flex items-center gap-2 text-[12px] text-slate-400">
                <t.icon className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 sm:px-10 lg:px-16">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-sm transition-transform [@media(hover:hover)]:group-hover:scale-110">
              <Leaf className="h-3.5 w-3.5 text-white" strokeWidth={2} />
            </span>
            <span className="text-[15px] font-bold text-foreground tracking-tight">SecretLeaf</span>
          </Link>
        </div>

        <div className="w-full max-w-[400px]">
          {mode === 'forgot' ? (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Passwort zurücksetzen</h1>
                  <p className="mt-2 text-sm text-muted-fg leading-relaxed">
                  Gib deine E-Mail-Adresse ein – wir senden dir einen Link zum Zurücksetzen.
                </p>
              </div>
              {info ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700 leading-relaxed">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold mb-1">E-Mail gesendet</p>
                      <p>{info}</p>
                      <button type="button" onClick={submitForgot}
                        className="mt-3 text-xs font-semibold text-emerald-700 underline-offset-2 hover:underline transition-transform duration-150 active:scale-[0.97]">
                        Erneut senden
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={submitForgot} className="space-y-5">
                  <AuthInput
                    ref={emailRef}
                    id="forgot-email"
                    label="E-Mail-Adresse"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError(null); }}
                    onBlur={() => setEmailError(validateEmail(email))}
                    error={emailError}
                    placeholder="du@beispiel.de"
                  />
                  {globalError && <ErrorBox message={globalError} />}
                  <button type="submit" disabled={pending}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-[transform,background-color,opacity] duration-150 shadow-sm flex items-center justify-center gap-2">
                    {pending ? <><Spinner />Wird gesendet…</> : 'Link zum Zurücksetzen senden'}
                  </button>
                </form>
              )}
              <p className="mt-6 text-center text-sm text-muted-fg">
                <button type="button" onClick={() => switchMode('login')}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 transition-[transform,color] duration-150 active:scale-[0.97]">
                  ← Zurück zum Login
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {mode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}
                </h1>
                <p className="mt-1.5 text-sm text-muted-fg">
                  {mode === 'login' ? 'Melde dich an, um fortzufahren.' : 'Kostenlos registrieren und loslegen.'}
                </p>
              </div>

              {/* Mode tabs */}
              <div className="mb-6 flex rounded-xl border border-border bg-background p-1 gap-1">
                {(['login', 'register'] as const).map(m => (
                  <button key={m} type="button" onClick={() => switchMode(m)}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold active:scale-[0.97] transition-[transform,background-color,color,box-shadow] duration-150 ${
                      mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-fg hover:text-foreground/80'
                    }`}>
                    {m === 'login' ? 'Anmelden' : 'Registrieren'}
                  </button>
                ))}
              </div>

              {info && (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-emerald-700 leading-relaxed">{info}</p>
                </div>
              )}

              <form onSubmit={submit} noValidate className="space-y-4">
                <AuthInput
                  ref={emailRef}
                  id="auth-email"
                  label="E-Mail-Adresse"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(null); }}
                  onBlur={() => setEmailError(validateEmail(email))}
                  error={emailError}
                  placeholder="du@beispiel.de"
                />

                <div className="space-y-1.5">
                  <PasswordField
                    id="auth-password"
                    label="Passwort"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPasswordError(null); }}
                    onBlur={() => setPasswordError(validatePassword(password, mode === 'register'))}
                    error={passwordError}
                    placeholder={mode === 'login' ? '••••••••••' : 'Mindestens 10 Zeichen'}
                    minLength={mode === 'register' ? MIN_PASSWORD_LENGTH : undefined}
                  />
                  {mode === 'register' && <PasswordStrength password={password} />}
                </div>

                {mode === 'register' && (
                  <PasswordField
                    id="auth-confirm"
                    label="Passwort bestätigen"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setConfirmError(null); }}
                    onBlur={() => {
                      if (confirmPassword && confirmPassword !== password) {
                        setConfirmError('Passwörter stimmen nicht überein.');
                      } else {
                        setConfirmError(null);
                      }
                    }}
                    error={confirmError}
                    placeholder="Passwort wiederholen"
                  />
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button type="button" onClick={() => switchMode('forgot')}
                      className="text-xs font-medium text-muted-fg hover:text-emerald-600 transition-[transform,color] duration-150 active:scale-[0.97]">
                      Passwort vergessen?
                    </button>
                  </div>
                )}

                {globalError && <ErrorBox message={globalError} />}

                <button type="submit" disabled={pending}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 active:bg-emerald-700 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-[transform,background-color,opacity] duration-150 shadow-sm shadow-emerald-900/20 flex items-center justify-center gap-2">
                  {pending ? (
                    <><Spinner />{mode === 'login' ? 'Anmelden…' : 'Konto erstellen…'}</>
                  ) : (
                    mode === 'login' ? 'Anmelden' : 'Kostenlos registrieren'
                  )}
                </button>
              </form>

              {mode === 'register' && (
                <div className="lg:hidden mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3">Dein Konto beinhaltet</p>
                  <ul className="space-y-2">
                    {['Studien speichern & wiederfinden', 'Personalisierte Inhalte', 'Wöchentlicher Wissens-Digest'].map(t => (
                      <li key={t} className="flex items-center gap-2 text-xs text-emerald-700">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Trust strip (mobile) */}
          <div className="lg:hidden mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {trustItems.map(t => (
              <span key={t.label} className="flex items-center gap-1.5 text-[11px] text-muted-fg">
                <t.icon className="h-3 w-3 text-emerald-500" strokeWidth={2} />
                {t.label}
              </span>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-fg">
            <Link href="/" className="font-medium text-muted-fg hover:text-emerald-600 transition-colors">
              ← Zur Startseite
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageInner />
    </Suspense>
  );
}
