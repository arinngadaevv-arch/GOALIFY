export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Your store&apos;s AI employee.
        </h1>
        <p className="max-w-md text-sm text-muted sm:text-base">
          AI Store Manager monitors, analyzes, and improves your Shopify store
          around the clock — and tells you exactly what&apos;s costing you sales.
        </p>
      </div>

      <form action="/api/auth/install" className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
        <input
          type="text"
          name="shop"
          placeholder="my-store.myshopify.com"
          required
          pattern="[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com"
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Connect store
        </button>
      </form>
    </main>
  );
}
