import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { CreditCard, Mail, User as UserIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getTodayGenerationCount, PLAN_LIMITS, type Plan } from "@/lib/usage";
import { SubscriptionActions } from "@/components/subscription-actions";
import { CheckoutStatusBanner } from "@/components/checkout-status-banner";

const STATUS_LABELS: Record<string, string> = {
  active: "פעיל",
  trialing: "בתקופת ניסיון",
  past_due: "תשלום נכשל",
  canceled: "בוטל",
  unpaid: "לא שולם",
  incomplete: "לא הושלם",
  incomplete_expired: "פג תוקף",
};

export default async function AccountPage() {
  const session = await auth();

  const [userRows, usedToday] = await Promise.all([
    db.select().from(users).where(eq(users.id, session!.user.id)).limit(1),
    getTodayGenerationCount(session!.user.id),
  ]);
  const user = userRows[0];
  const plan = user.plan as Plan;
  const limit = PLAN_LIMITS[plan].dailyGenerations;
  const statusLabel = user.subscriptionStatus
    ? (STATUS_LABELS[user.subscriptionStatus] ?? user.subscriptionStatus)
    : null;

  return (
    <div className="mx-auto max-w-2xl">
      <Suspense>
        <CheckoutStatusBanner />
      </Suspense>

      <h1 className="text-2xl font-extrabold">החשבון שלי</h1>
      <p className="mt-1 text-sm text-muted">
        פרטי הפרופיל, המנוי והשימוש היומי שלכם.
      </p>

      <section className="mt-8 rounded-2xl border border-border bg-surface/60 p-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <UserIcon className="size-4 text-neon-purple" />
          פרופיל
        </h2>
        <div className="mt-4 space-y-2 text-sm">
          <p className="flex items-center gap-2 text-muted">
            <UserIcon className="size-3.5" />
            {user.name || "-"}
          </p>
          <p className="flex items-center gap-2 text-muted">
            <Mail className="size-3.5" />
            {user.email}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface/60 p-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <CreditCard className="size-4 text-neon-blue" />
          מנוי וחיוב
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted">תוכנית נוכחית</p>
            <p className="mt-1 text-lg font-bold">{PLAN_LIMITS[plan].label}</p>
          </div>
          {statusLabel && (
            <div>
              <p className="text-xs text-muted">סטטוס מנוי</p>
              <p className="mt-1 text-lg font-bold">{statusLabel}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted">שימוש היום</p>
            <p className="mt-1 text-lg font-bold">
              {usedToday}
              {limit !== Infinity ? ` / ${limit}` : " · ללא הגבלה"}
            </p>
          </div>
          {user.stripeCurrentPeriodEnd && (
            <div>
              <p className="text-xs text-muted">
                {user.cancelAtPeriodEnd ? "המנוי יסתיים בתאריך" : "החידוש הבא"}
              </p>
              <p className="mt-1 text-lg font-bold">
                {new Date(user.stripeCurrentPeriodEnd).toLocaleDateString("he-IL")}
              </p>
            </div>
          )}
        </div>

        <Suspense>
          <SubscriptionActions
            currentPlan={plan}
            hasStripeCustomer={!!user.stripeCustomerId}
          />
        </Suspense>
      </section>
    </div>
  );
}
