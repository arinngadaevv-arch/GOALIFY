"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanSearch, Loader2 } from "lucide-react";

export function ScanButton({ label = "Run full scan" }: { label?: string }) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runScan() {
    setScanning(true);
    setError(null);
    try {
      const response = await fetch("/api/scan", { method: "POST" });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Scan failed");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={runScan}
        disabled={scanning}
        className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {scanning ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Scanning your store…
          </>
        ) : (
          <>
            <ScanSearch size={15} />
            {label}
          </>
        )}
      </button>
      {error && <p className="text-xs text-bad">{error}</p>}
    </div>
  );
}
