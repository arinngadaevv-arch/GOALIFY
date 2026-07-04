"use client";

import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { useCheckout, type CheckoutPlan } from "@/components/use-checkout";

const TIERS: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  plan: "FREE" | CheckoutPlan;
}[] = [
  {
    name: "חינם",
    price: "₪0",
    period: "לתמיד",
    description: "מושלם כדי להתנסות וליצור את התוכן הראשון שלכם.",
    features: [
      "3 יצירות תוכן ביום",
      "5 רעיונות ויראליים + 3 תסריטים מלאים",
      "ציון ויראליות לכל רעיון",
      "מתכנן תוכן שבועי",
      "העתקה והורדה כ-PDF",
    ],
    cta: "התחילו בחינם",
    highlighted: false,
    plan: "FREE",
  },
  {
    name: "פרו",
    price: "₪79",
    period: "לחודש",
    description: "לעסקים ויוצרי תוכן שרוצים לפרסם בלי הגבלה.",
    features: [
      "יצירות תוכן ללא הגבלה",
      "כל היכולות של תוכנית החינם",
      "עדיפות בזמני יצירה",
      "שמירת פרויקטים ללא הגבלה",
      "תמיכה מהירה",
    ],
    cta: "שדרגו לפרו",
    highlighted: true,
    plan: "PRO",
  },
  {
    name: "עסקי",
    price: "₪249",
    period: "לחודש",
    description: "לסוכנויות ולעסקים שמנהלים כמה לקוחות או מותגים.",
    features: [
      "כל היכולות של תוכנית פרו",
      "ניהול מספר לקוחות ומותגים",
      "ניהול צוותים והרשאות",
      "דוחות ביצועים מרוכזים",
      "מנהל הצלחת לקוח ייעודי",
    ],
    cta: "שדרגו לעסקי",
    highlighted: false,
    plan: "BUSINESS",
  },
];

export function PricingCards() {
  const { startCheckout, loading, error } = useCheckout();

  return (
    <div>
      {error && (
        <p className="mb-6 rounded-lg bg-red-500/10 px-4 py-2 text-center text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl p-6 flex flex-col ${
              tier.highlighted
                ? "gradient-border glow-pink bg-surface"
                : "border border-border bg-surface/60"
            }`}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 right-6 rounded-full gradient-brand px-3 py-1 text-xs font-semibold text-white">
                הכי פופולרי
              </span>
            )}
            <h3 className="text-lg font-bold">{tier.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold">{tier.price}</span>
              <span className="text-sm text-muted">/ {tier.period}</span>
            </div>
            <p className="mt-3 text-sm text-muted">{tier.description}</p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-neon-blue" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {tier.plan === "FREE" ? (
              <Link
                href="/sign-up"
                className="mt-6 rounded-full bg-surface-2 px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
              >
                {tier.cta}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => startCheckout(tier.plan as CheckoutPlan)}
                disabled={loading !== null}
                className={`mt-6 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 ${
                  tier.highlighted
                    ? "gradient-brand text-white"
                    : "bg-surface-2 text-foreground"
                }`}
              >
                {loading === tier.plan && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {tier.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
