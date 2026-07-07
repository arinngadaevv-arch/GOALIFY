export function TopBar({ shopName }: { shopName: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold">Good morning 👋</h1>
        <p className="text-sm text-muted">{shopName}</p>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        AI is monitoring your store
      </div>
    </header>
  );
}
