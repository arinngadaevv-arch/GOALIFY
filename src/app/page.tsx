import Link from "next/link";
import {
  ArrowLeft,
  Wand2,
  CalendarDays,
  Gauge,
  Download,
  Copy,
  Clapperboard,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { PricingCards } from "@/components/pricing-cards";

const FEATURES = [
  {
    icon: Wand2,
    title: "מחולל תוכן AI חכם",
    description:
      "5 רעיונות ויראליים, 3 תסריטים מלאים, הוקים, כיתובים והאשטגים - הכל מותאם אישית לעסק שלכם תוך שניות.",
  },
  {
    icon: Gauge,
    title: "ציון ויראליות לכל רעיון",
    description:
      "כל רעיון מקבל ציון 1-100 עם הסבר קצר וממוקד למה הוא עשוי לעבוד - כדי שתדעו על מה להתמקד קודם.",
  },
  {
    icon: CalendarDays,
    title: "מתכנן תוכן שבועי",
    description:
      "תוכנית מלאה ל-7 ימים עם רעיון, סוג תוכן ומטרה לכל יום - כדי שלעולם לא תשארו בלי מה לפרסם.",
  },
  {
    icon: Clapperboard,
    title: "פירוק צילום שלב-אחר-שלב",
    description:
      "בדיוק מה לצלם, איך ובאיזה סדר - גם אם מעולם לא צילמתם תוכן לרשתות חברתיות.",
  },
  {
    icon: Copy,
    title: "כיתובים והאשטגים מוכנים",
    description:
      "קאפשן שמותאם למקסימום אנגייג'מנט, יחד עם האשטגים רלוונטיים וטרנדיים לפלטפורמה שבחרתם.",
  },
  {
    icon: Download,
    title: "ייצוא ושמירה",
    description:
      "העתיקו בלחיצה, הורידו כ-PDF, ושמרו את כל הפרויקטים שלכם בדשבורד אחד מסודר.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "ספרו לנו על העסק",
    description: "סוג העסק, קהל היעד, סגנון הכתיבה והפלטפורמה - דקה אחת בלבד.",
  },
  {
    step: "2",
    title: "קבלו חבילת תוכן מלאה",
    description: "רעיונות, תסריטים, הוקים, כיתובים והאשטגים - מוכן להעלאה.",
  },
  {
    step: "3",
    title: "צלמו, פרסמו, תצמחו",
    description: "עקבו אחרי ציון הוויראליות ותוכנית השבוע, וצפו בעסק גדל.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(60% 60% at 30% 20%, var(--neon-pink) 0%, transparent 60%), radial-gradient(50% 50% at 70% 10%, var(--neon-blue) 0%, transparent 60%), radial-gradient(50% 50% at 50% 40%, var(--neon-purple) 0%, transparent 60%)",
            }}
          />
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
              <span className="size-1.5 rounded-full gradient-brand" />
              מבוסס על Claude AI
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-6xl">
              תוכן ויראלי לטיקטוק ואינסטגרם
              <br />
              <span className="gradient-text">תוך שניות, לא שעות</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
              TrendSpark AI הופך אתכם, בעלי עסקים קטנים, ליוצרי תוכן מקצועיים.
              הזינו פרטים על העסק וקבלו רעיונות, תסריטים וכיתובים ויראליים
              שמביאים לקוחות אמיתיים.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="group flex w-full items-center justify-center gap-2 rounded-full gradient-brand px-8 py-4 text-base font-bold text-white shadow-xl shadow-pink-500/25 transition-transform hover:scale-[1.03] sm:w-auto"
              >
                צרו תוכן עכשיו - בחינם
                <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="w-full rounded-full border border-border px-8 py-4 text-center text-base font-semibold text-foreground transition-colors hover:bg-surface sm:w-auto"
              >
                לצפייה במחירים
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">
              בלי כרטיס אשראי · 3 יצירות חינם ביום · הקמה תוך דקה
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-border bg-surface/60 p-6"
              >
                <div className="grid size-9 place-items-center rounded-full gradient-brand text-sm font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              כל מה שצריך כדי{" "}
              <span className="gradient-text">להפוך לויראלי</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              לא עוד מסך ריק. TrendSpark AI נותן לכם חבילת תוכן שלמה שאפשר
              לצלם ולפרסם באותו יום.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-surface/60 p-6 transition-colors hover:border-neon-purple/50"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-surface-2">
                  <feature.icon className="size-5 text-neon-blue" />
                </div>
                <h3 className="mt-4 font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing preview */}
        <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              מחיר פשוט, <span className="gradient-text">בלי הפתעות</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              התחילו בחינם, שדרגו כשתהיו מוכנים לפרסם בלי הגבלה.
            </p>
          </div>
          <div className="mt-12">
            <PricingCards />
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
          <div className="gradient-border glow-pink rounded-3xl p-10 text-center">
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              מוכנים ליצור את הפוסט הויראלי הבא שלכם?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              הצטרפו לבעלי עסקים קטנים שכבר יוצרים תוכן מקצועי בלי מאמץ.
            </p>
            <Link
              href="/sign-up"
              className="mt-6 inline-flex items-center gap-2 rounded-full gradient-brand px-8 py-4 text-base font-bold text-white shadow-xl shadow-pink-500/25 transition-transform hover:scale-[1.03]"
            >
              התחילו בחינם עכשיו
              <ArrowLeft className="size-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted sm:px-6">
        © {new Date().getFullYear()} TrendSpark AI. כל הזכויות שמורות.
      </footer>
    </div>
  );
}
