type Benefit = { icon: string; text: string };

const BENEFITS: Benefit[] = [
  { icon: '🔖', text: 'Studien speichern und jederzeit wiederfinden' },
  { icon: '✦',  text: 'Personalisierte Inhalte nach deinen Interessen' },
  { icon: '📖', text: 'Persönlicher Leseverlauf' },
  { icon: '📬', text: 'Wöchentliche Zusammenfassung der wichtigsten Studien' },
  { icon: '🔬', text: 'Zugang zu allen Forschungsartikeln' },
];

export default function AuthBenefits() {
  return (
    <ul className="space-y-3">
      {BENEFITS.map(b => (
        <li key={b.text} className="flex items-center gap-3 text-sm text-emerald-100/90">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-sm flex-shrink-0">
            {b.icon}
          </span>
          {b.text}
        </li>
      ))}
    </ul>
  );
}
