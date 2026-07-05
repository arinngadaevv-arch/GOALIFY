import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  Eye,
  ShieldCheck,
  Target,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { PricingCards } from "@/components/pricing-cards";
import { HeroDecisionMock } from "@/components/hero-decision-mock";

const FEATURES = [
  {
    icon: Target,
    title: "מהלך אחד ברור, לא הצפה",
    description:
      "לא עוד רשימת רעיונות אינסופית. בכל צ׳ק-אין אנחנו מזהים את צוואר הבקבוק האחד שהכי מעכב אתכם, ונותנים דבר אחד ברור לעשות עכשיו.",
  },
  {
    icon: ShieldCheck,
    title: "ביטחון אמיתי, לא מומצא",
    description:
      "אין כאן אחוזים מפוברקים. כל אבחנה מגיעה עם רמת ביטחון כנה - נמוך, בינוני או גבוה - ונימוק אמיתי למה בדיוק.",
  },
  {
    icon: Eye,
    title: "שקיפות מלאה על החשיבה",
    description:
      "רואים בדיוק אילו חלופות נשקלו ונפסלו, ומה קריטריון ההפרכה - איך נדע אם טעינו - עוד לפני שהתוצאה ידועה.",
  },
  {
    icon: UserCheck,
    title: "אדם בודק לפני שמגיע אליכם",
    description:
      "כל אבחון עובר בדיקת אדם לפני שהוא נשלח. עוד לא הרווחנו את הזכות להפוך את זה לאוטומטי לגמרי - ואתם לא צריכים לשלם על הטעויות שבדרך.",
  },
  {
    icon: TrendingUp,
    title: "לומדים מה עובד אצלכם",
    description:
      "כל מהלך שנשלח נבדק מול המציאות. עם הזמן אנחנו מזהים את הערוץ החזק שלכם ואת הדפוסים שבאמת מביאים תוצאה - ולא מנחשים שוב.",
  },
  {
    icon: Compass,
    title: "Exploit או Explore - בגלוי",
    description:
      "לפעמים ממליצים על מה שכבר הוכיח את עצמו אצלכם, ולפעמים בודקים השערה חדשה. תמיד תדעו איזה מהשניים, ולמה.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "כמה בחירות מהירות",
    description:
      "לא טפסים ארוכים. שש שאלות קצרות על השבוע שלכם - חשיפה, פניות, סגירות, יומן.",
  },
  {
    step: "2",
    title: "אבחון + מהלך אחד",
    description:
      "אנחנו מזהים את החוליה השבורה בשרשרת, ונותנים מהלך אחד קונקרטי - עם ביטחון כנה ושקיפות מלאה.",
  },
  {
    step: "3",
    title: "מבצעים, ולומדים יחד",
    description:
      "מבצעים או לא - ומספרים לנו מה קרה. כך אנחנו נהיים מדויקים יותר בכל שבוע שעובר.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(60% 60% at 30% 20%, var(--neon-pink) 0%, transparent 60%), radial-gradient(50% 50% at 70% 10%, var(--neon-blue) 0%, transparent 60%), radial-gradient(50% 50% at 50% 40%, var(--neon-purple) 0%, transparent 60%)",
            }}
          />
          <div
            aria-hidden
            className="animate-float-slow pointer-events-none absolute -right-10 top-10 -z-10 size-72 rounded-full bg-neon-pink/20 blur-3xl"
          />
          <div
            aria-hidden
            className="animate-float-slower pointer-events-none absolute -left-16 top-40 -z-10 size-80 rounded-full bg-neon-blue/15 blur-3xl"
          />
          <div className="mx-auto max-w-4xl text-center animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
              <span className="size-1.5 rounded-full gradient-brand" />
              נבנה עם Claude AI, מאושר בידי אדם לפני שהוא מגיע אליכם
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-6xl">
              אנחנו לא עוזרים לכם
              <br />
              לקבל <span className="gradient-text">יותר החלטות</span>.
              <br />
              אנחנו עוזרים לכם <span className="gradient-text">להפסיק לנחש</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
              TrendSpark AI הוא השותף העסקי של הקוסמטיקאית והאסתטיקאית העצמאית.
              כל שבוע אנחנו מאבחנים מה באמת מעכב את העסק שלכם, ונותנים לכם דבר
              אחד ברור לעשות - עם ביטחון כנה, לא מומצא.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="group flex w-full items-center justify-center gap-2 rounded-full gradient-brand px-8 py-4 text-base font-bold text-white shadow-xl shadow-pink-500/25 transition-transform hover:scale-[1.03] sm:w-auto"
              >
                תתחילו להפסיק לנחש - בחינם
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
              בלי כרטיס אשראי · עסק אחד בחינם · הקמה תוך דקה
            </p>
          </div>

          {/* Live taste of the actual product - not an abstract mockup */}
          <div className="relative mt-16 animate-fade-in-up delay-2">
            <p className="mb-4 text-center text-xs font-medium text-muted">
              ככה זה נראה כשמגיע אליכם
            </p>
            <HeroDecisionMock />
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              איך זה <span className="gradient-text">עובד בפועל</span>
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((item, i) => (
              <div
                key={item.step}
                className={`hover-lift animate-fade-in-up delay-${i + 1} rounded-2xl border border-border bg-surface/60 p-6`}
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
              מערכת קבלת החלטות{" "}
              <span className="gradient-text">לא עוד מחולל תוכן</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              המוצר בנוי סביב עיקרון אחד: לעולם לא להציג ביטחון שאין לנו.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="hover-lift rounded-2xl border border-border bg-surface/60 p-6 hover:border-neon-purple/50"
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
              התחילו בחינם עם עסק אחד, שדרגו כשתרצו לדעת מה באמת עובד אצלכם.
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
              מוכנות להפסיק לנחש מה יעבוד השבוע?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              הצטרפו לבעלות עסקים שכבר מקבלות מהלך אחד ברור, במקום עוד רשימת
              משימות שאף אחד לא בטוח שתעבוד.
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
