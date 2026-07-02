import Link from "next/link";
import { Check } from "lucide-react";

const TIERS = [
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
    href: "/sign-up",
    highlighted: false,
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
    href: "/sign-up",
    highlighted: true,
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
    cta: "דברו איתנו",
    href: "/sign-up",
    highlighted: false,
  },
];

export function PricingCards() {
  return (
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
          <Link
            href={tier.href}
            className={`mt-6 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${
              tier.highlighted
                ? "gradient-brand text-white"
                : "bg-surface-2 text-foreground"
            }`}
          >
            {tier.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}
