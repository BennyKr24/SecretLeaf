'use client';

/**
 * Minimum password length enforced at signup.
 * Set to 10 characters to meet NIST SP 800-63B recommendations for memorized secrets
 * while staying usable for most users without requiring special character complexity.
 */
export const MIN_PASSWORD_LENGTH = 10;
/** Length at which we consider a password "good" in the strength meter */
const GOOD_PASSWORD_LENGTH = 12;

type Props = {
  password: string;
};

type Level = { label: string; color: string; bg: string; width: string };

function getLevel(pw: string): Level {
  if (pw.length === 0) return { label: '', color: 'bg-border', bg: 'bg-background', width: 'w-0' };

  let score = 0;
  if (pw.length >= MIN_PASSWORD_LENGTH) score++;
  if (pw.length >= GOOD_PASSWORD_LENGTH) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { label: 'Sehr schwach', color: 'bg-red-400',    bg: 'bg-background', width: 'w-1/5' };
  if (score === 2) return { label: 'Schwach',      color: 'bg-orange-400', bg: 'bg-background', width: 'w-2/5' };
  if (score === 3) return { label: 'Mittel',       color: 'bg-amber-400',  bg: 'bg-background', width: 'w-3/5' };
  if (score === 4) return { label: 'Gut',          color: 'bg-emerald-400',bg: 'bg-background', width: 'w-4/5' };
  return               { label: 'Stark',           color: 'bg-emerald-500',bg: 'bg-background', width: 'w-full' };
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
        <p className="text-[11px] text-muted-fg">
          Passwortstärke: <span className="font-semibold text-foreground/80">{level.label}</span>
        </p>
      )}
    </div>
  );
}
