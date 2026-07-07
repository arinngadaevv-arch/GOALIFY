import { redirect } from "next/navigation";
import { getProducts } from "@/lib/dashboard-data";
import { getSessionShop } from "@/lib/session";

function scoreColor(value: number | null): string {
  if (value === null) return "var(--muted)";
  if (value >= 75) return "var(--good)";
  if (value >= 50) return "var(--warn)";
  return "var(--bad)";
}

export default async function ProductsPage() {
  const shop = await getSessionShop();
  if (!shop) redirect("/");

  const rows = await getProducts(shop.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold">Products</h2>
        <p className="text-xs text-muted">
          Every product gets an optimization score from the latest scan — lowest scores are the
          biggest opportunities.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          No products synced yet — run a store scan first.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-140 text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Images</th>
                <th className="px-4 py-3 font-medium">Variants</th>
                <th className="px-4 py-3 font-medium">Optimization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((product) => (
                <tr key={product.id} className="bg-surface/50">
                  <td className="max-w-72 truncate px-4 py-3 font-medium">{product.title}</td>
                  <td className="px-4 py-3 text-muted">{product.status?.toLowerCase() ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {product.price ? `${shop.currency ?? "$"} ${product.price}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">{product.imageCount}</td>
                  <td className="px-4 py-3 text-muted">{product.variantCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: scoreColor(product.optimizationScore) }}
                      >
                        {product.optimizationScore ?? "—"}
                      </span>
                      {product.optimizationScore !== null && (
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${product.optimizationScore}%`,
                              backgroundColor: scoreColor(product.optimizationScore),
                            }}
                          />
                        </div>
                      )}
                    </div>
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
