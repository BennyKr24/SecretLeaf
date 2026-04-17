'use client';

type Props = {
  password: string;
};

type Level = { label: string; color: string; bg: string; width: string };

function getLevel(pw: string): Level {
  if (pw.length === 0) return { label: '', color: 'bg-slate-200', bg: 'bg-slate-100', width: 'w-0' };

  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { label: 'Sehr schwach', color: 'bg-red-400',    bg: 'bg-slate-100', width: 'w-1/5' };
  if (score === 2) return { label: 'Schwach',      color: 'bg-orange-400', bg: 'bg-slate-100', width: 'w-2/5' };
  if (score === 3) return { label: 'Mittel',       color: 'bg-amber-400',  bg: 'bg-slate-100', width: 'w-3/5' };
  if (score === 4) return { label: 'Gut',          color: 'bg-emerald-400',bg: 'bg-slate-100', width: 'w-4/5' };
  return               { label: 'Stark',           color: 'bg-emerald-500',bg: 'bg-slate-100', width: 'w-full' };
}

export default function PasswordStrength({ password }: Props) {
  if (!password) return null;
  const level = getLevel(password);

  return (
    <div className="space-y-1">
      <div className={`h-1 w-full rounded-full overflow-hidden ${level.bg}`}>
        <div className={`h-full rounded-full transition-all duration-300 ${level.color} ${level.width}`} />
      </div>
      {level.label && (
        <p className="text-[11px] text-slate-500">
          Passwortstärke: <span className="font-semibold text-slate-700">{level.label}</span>
        </p>
      )}
    </div>
  );
}
