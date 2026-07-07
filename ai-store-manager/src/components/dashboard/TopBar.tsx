export function TopBar({
  shopName,
  pendingCount,
}: {
  shopName: string;
  pendingCount: number;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold">{shopName}</h1>
        <p className="text-sm text-muted">Your AI store manager</p>
      </div>
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {pendingCount} open recommendation{pendingCount > 1 ? "s" : ""}
        </div>
      )}
    </header>
  );
}
