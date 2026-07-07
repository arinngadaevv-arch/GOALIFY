import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { recommendations } from "@/db/schema";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { getSessionShop } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shop = await getSessionShop();
  if (!shop) {
    redirect("/");
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(recommendations)
    .where(and(eq(recommendations.shopId, shop.id), eq(recommendations.status, "pending")));

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar shopName={shop.shopName ?? shop.domain} pendingCount={count} />
        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
