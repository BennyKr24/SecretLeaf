export default function AuthDivider({ label = 'oder' }: { label?: string }) {
  return (
    <div className="relative flex items-center">
      <div className="flex-grow border-t border-slate-200" />
      <span className="mx-3 text-xs text-slate-400 flex-shrink-0">{label}</span>
      <div className="flex-grow border-t border-slate-200" />
    </div>
  );
}
