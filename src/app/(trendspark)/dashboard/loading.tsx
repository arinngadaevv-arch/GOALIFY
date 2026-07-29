export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-surface-2" />
      <div className="mt-2 h-4 w-64 rounded bg-surface-2/60" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-surface/60 p-5"
          >
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 rounded-full bg-surface-2" />
              <div className="h-4 w-16 rounded bg-surface-2/60" />
            </div>
            <div className="mt-4 h-5 w-32 rounded bg-surface-2" />
            <div className="mt-2 h-4 w-full rounded bg-surface-2/60" />
            <div className="mt-1.5 h-4 w-2/3 rounded bg-surface-2/60" />
            <div className="mt-3 h-6 w-16 rounded-full bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
