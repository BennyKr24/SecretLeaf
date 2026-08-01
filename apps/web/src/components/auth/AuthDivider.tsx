export default function AuthDivider({ label = 'oder' }: { label?: string }) {
  return (
    <div className="relative flex items-center">
      <div className="flex-grow border-t border-border" />
      <span className="mx-3 text-xs text-muted-fg flex-shrink-0">{label}</span>
      <div className="flex-grow border-t border-border" />
    </div>
  );
}
