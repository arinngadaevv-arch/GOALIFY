import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ScanButton } from "@/components/dashboard/ScanButton";
import { getScanHistory } from "@/lib/dashboard-data";
import { getSessionShop } from "@/lib/session";

export default async function ScannerPage() {
  const shop = await getSessionShop();
  if (!shop) redirect("/");

  const history = await getScanHistory(shop.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Store Scanner</h2>
          <p className="text-xs text-muted">
            Every scan covers products, collections, homepage, navigation, policies, SEO,
            accessibility, trust signals and branding consistency.
          </p>
        </div>
        <ScanButton />
      </div>

      {history.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          No scans yet — run your first one above.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-160 text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Health</th>
                <th className="px-4 py-3 font-medium">Conversion</th>
                <th className="px-4 py-3 font-medium">SEO</th>
                <th className="px-4 py-3 font-medium">Design</th>
                <th className="px-4 py-3 font-medium">Trust</th>
                <th className="px-4 py-3 font-medium">Perf</th>
                <th className="px-4 py-3 font-medium">A11y</th>
                <th className="px-4 py-3 font-medium">Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((scan) => (
                <tr key={scan.id} className="bg-surface/50">
                  <td className="px-4 py-3 text-muted">
                    {formatDistanceToNow(scan.startedAt, { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 font-semibold">{scan.storeHealthScore ?? "—"}</td>
                  <td className="px-4 py-3">{scan.conversionScore ?? "—"}</td>
                  <td className="px-4 py-3">{scan.seoScore ?? "—"}</td>
                  <td className="px-4 py-3">{scan.designScore ?? "—"}</td>
                  <td className="px-4 py-3">{scan.trustScore ?? "—"}</td>
                  <td className="px-4 py-3">{scan.performanceScore ?? "—"}</td>
                  <td className="px-4 py-3">{scan.accessibilityScore ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {Array.isArray(scan.rawFindings) ? scan.rawFindings.length : 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
