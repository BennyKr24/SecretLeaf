import { Bookmark, Sparkles, BookOpen, Mail, Microscope, type LucideIcon } from 'lucide-react';

type Benefit = { icon: LucideIcon; text: string };

const BENEFITS: Benefit[] = [
  { icon: Bookmark, text: 'Studien speichern und jederzeit wiederfinden' },
  { icon: Sparkles, text: 'Personalisierte Inhalte nach deinen Interessen' },
  { icon: BookOpen, text: 'Persönlicher Leseverlauf' },
  { icon: Mail, text: 'Wöchentliche Zusammenfassung der wichtigsten Studien' },
  { icon: Microscope, text: 'Zugang zu allen Forschungsartikeln' },
];

export default function AuthBenefits() {
  return (
    <ul className="space-y-3">
      {BENEFITS.map(b => (
        <li key={b.text} className="flex items-center gap-3 text-sm text-emerald-100/90">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex-shrink-0">
            <b.icon className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          {b.text}
        </li>
      ))}
    </ul>
  );
}
