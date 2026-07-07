import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { shopSettings } from "@/db/schema";
import { AutomationModePicker } from "@/components/dashboard/AutomationModePicker";
import { getSessionShop } from "@/lib/session";

export default async function SettingsPage() {
  const shop = await getSessionShop();
  if (!shop) redirect("/");

  const [settings] = await db
    .select()
    .from(shopSettings)
    .where(eq(shopSettings.shopId, shop.id))
    .limit(1);

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold">Automation</h2>
        <p className="text-xs text-muted">
          Choose how much the AI is allowed to do on its own. You can change this anytime.
        </p>
      </div>
      <AutomationModePicker current={settings?.automationMode ?? "suggest_only"} />

      <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm">
        <h3 className="font-medium">Connected store</h3>
        <p className="mt-1 text-muted">
          {shop.shopName ?? shop.domain} · {shop.domain}
        </p>
      </div>
    </div>
  );
}
