"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

const STEPS = [
  "קוראים את הסימנים החיוניים...",
  "מחפשים את החוליה השבורה בשרשרת...",
  "בודקים מה כבר יודעים על העסק הזה...",
  "מרכיבים אבחנה ומהלך...",
];

type Option = { emoji: string; label: string; value: string };

type Question = {
  key: keyof typeof EMPTY_FIELDS;
  emoji: string;
  label: string;
  options: Option[];
  allowOther?: boolean;
};

// Encouraging micro-copy that shifts as answers come in, so six questions feel
// like quick momentum ("עוד קצת ויש לנו הכל") rather than a long form.
function progressMessage(answered: number, total: number): string {
  const remaining = total - answered;
  if (answered === 0) return "כמה לחיצות מהירות ואנחנו מאבחנים";
  if (remaining === 0) return "מושלם — יש לנו הכל ✨";
  if (remaining === 1) return "עוד תשובה אחת וסיימנו! 🔥";
  if (answered >= total / 2) return "עוד קצת ויש לנו כמעט הכל 🔥";
  return "יופי, ממשיכים 💪";
}

const EMPTY_FIELDS = {
  exposureThisWeek: "",
  inquiriesThisWeek: "",
  closingsThisWeek: "",
  emptySlotsThisWeek: "",
  returningVsNewCustomers: "",
  recentAnomaly: "",
};

// Qualitative bands, not exact numbers: real answers are fuzzy, and forcing
// precise counts would invite invented precision. Each option's `value` is a
// self-contained Hebrew phrase - it's what the diagnosis model actually reads.
const QUESTIONS: Question[] = [
  {
    key: "exposureThisWeek",
    emoji: "📊",
    label: "כמה חשיפה הייתה השבוע? (צפיות בסטורי/ריל)",
    options: [
      { emoji: "📉", label: "פחות מהרגיל", value: "פחות חשיפה מהרגיל" },
      { emoji: "➡️", label: "כמו תמיד", value: "חשיפה רגילה, כמו בכל שבוע" },
      { emoji: "📈", label: "יותר מהרגיל", value: "יותר חשיפה מהרגיל" },
      { emoji: "🤷", label: "לא בדקתי", value: "לא בדקתי מספרים מדויקים" },
    ],
  },
  {
    key: "inquiriesThisWeek",
    emoji: "💬",
    label: "כמה פניות אמיתיות מלקוחות פוטנציאליים היו השבוע?",
    options: [
      { emoji: "😶", label: "כמעט אף אחת", value: "כמעט לא היו פניות השבוע" },
      { emoji: "🙂", label: "בודדות", value: "מעט פניות (בערך 1-3)" },
      { emoji: "😊", label: "כמה טובות", value: "כמה פניות טובות (בערך 4-8)" },
      { emoji: "🤩", label: "הרבה", value: "הרבה פניות (9 ומעלה)" },
    ],
  },
  {
    key: "closingsThisWeek",
    emoji: "✅",
    label: "כמה מהפניות האלה הפכו לתור שנקבע?",
    options: [
      { emoji: "❌", label: "אף אחת", value: "אף פנייה לא הפכה לתור" },
      { emoji: "◔", label: "חלק מהן", value: "חלק מהפניות הפכו לתור" },
      { emoji: "◑", label: "בערך חצי", value: "בערך חצי מהפניות נסגרו לתור" },
      { emoji: "◕", label: "רוב או כולן", value: "רוב הפניות או כולן נסגרו לתור" },
    ],
  },
  {
    key: "emptySlotsThisWeek",
    emoji: "📅",
    label: "כמה תורים ריקים יש לך השבוע?",
    options: [
      { emoji: "🔥", label: "היומן מלא", value: "היומן מלא, אין תורים ריקים" },
      { emoji: "🙂", label: "כמה חורים", value: "יש כמה תורים ריקים בודדים" },
      { emoji: "😕", label: "הרבה ריקים", value: "הרבה תורים ריקים השבוע" },
      { emoji: "🫥", label: "כמעט ריק", value: "היומן כמעט ריק השבוע" },
    ],
  },
  {
    key: "returningVsNewCustomers",
    emoji: "🔁",
    label: "איך מרגיש היחס בין לקוחות חוזרות לחדשות לאחרונה?",
    options: [
      { emoji: "💜", label: "רובן חוזרות", value: "כמעט כל הלקוחות חוזרות, מעט מאוד חדשות" },
      { emoji: "⚖️", label: "מעורב", value: "יחס מעורב בין לקוחות חוזרות לחדשות" },
      { emoji: "✨", label: "בעיקר חדשות", value: "בעיקר לקוחות חדשות לאחרונה" },
      { emoji: "🤷", label: "לא בטוחה", value: "לא בטוחה מה היחס" },
    ],
  },
  {
    key: "recentAnomaly",
    emoji: "⚡",
    label: "קרה משהו חריג לאחרונה? (מבצע, חג, שינוי מחיר)",
    allowOther: true,
    options: [
      { emoji: "🟢", label: "שבוע רגיל", value: "לא קרה שום דבר חריג, שבוע רגיל" },
      { emoji: "🏷️", label: "מבצע/הנחה", value: "היה מבצע או הנחה לאחרונה" },
      { emoji: "🎉", label: "חג/אירוע", value: "היה חג או אירוע מיוחד" },
      { emoji: "💰", label: "שינוי מחיר", value: "שיניתי מחיר לאחרונה" },
    ],
  },
];

export function CheckinForm({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [fields, setFields] = useState({ ...EMPTY_FIELDS });
  // Tracks which questions are in "other / free text" mode (only recentAnomaly today).
  const [otherActive, setOtherActive] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function selectOption(key: keyof typeof EMPTY_FIELDS, value: string) {
    setOtherActive((o) => ({ ...o, [key]: false }));
    setFields((f) => ({ ...f, [key]: value }));
  }

  function activateOther(key: keyof typeof EMPTY_FIELDS) {
    setOtherActive((o) => ({ ...o, [key]: true }));
    setFields((f) => ({ ...f, [key]: "" }));
  }

  function updateOther(key: keyof typeof EMPTY_FIELDS, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  const answeredCount = Object.values(fields).filter((v) => v.trim() !== "").length;
  const allAnswered = answeredCount === QUESTIONS.length;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!allAnswered) return;
    setError(null);
    setLoading(true);
    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 2500);

    try {
      const res = await fetch(`/api/businesses/${businessId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "משהו השתבש, נסו שוב");
        setLoading(false);
        clearInterval(interval);
        return;
      }
      router.refresh();
    } catch {
      setError("משהו השתבש, נסו שוב");
      setLoading(false);
    } finally {
      clearInterval(interval);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick-quiz progress: makes six taps feel like fast momentum, not a form. */}
      <div className="sticky top-0 z-10 -mx-1 bg-background/80 px-1 py-2 backdrop-blur">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
          <span key={answeredCount} className="animate-fade-in">
            {progressMessage(answeredCount, QUESTIONS.length)}
          </span>
          <span className="font-medium text-foreground">
            {answeredCount}/{QUESTIONS.length}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full gradient-brand transition-all duration-300"
            style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {QUESTIONS.map((q) => {
        const isOther = otherActive[q.key] ?? false;
        return (
          <div key={q.key}>
            <p className="mb-2.5 text-sm font-medium text-foreground">
              <span className="ml-1">{q.emoji}</span>
              {q.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const selected = !isOther && fields[q.key] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => selectOption(q.key, opt.value)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all ${
                      selected
                        ? "border-neon-purple bg-neon-purple/10 text-foreground"
                        : "border-border bg-surface text-muted hover:border-neon-purple/50 hover:text-foreground"
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    {opt.label}
                  </button>
                );
              })}
              {q.allowOther && (
                <button
                  type="button"
                  onClick={() => activateOther(q.key)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isOther
                      ? "border-neon-purple bg-neon-purple/10 text-foreground"
                      : "border-border bg-surface text-muted hover:border-neon-purple/50 hover:text-foreground"
                  }`}
                >
                  <span>✏️</span>
                  משהו אחר
                </button>
              )}
            </div>
            {q.allowOther && isOther && (
              <input
                autoFocus
                value={fields[q.key]}
                onChange={(e) => updateOther(q.key, e.target.value)}
                placeholder="ספרי במילים שלך מה קרה"
                maxLength={300}
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-neon-purple"
              />
            )}
          </div>
        );
      })}

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !allAnswered}
        className="flex w-full items-center justify-center gap-2 rounded-full gradient-brand px-6 py-4 text-base font-bold text-white shadow-xl shadow-pink-500/25 transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            <span key={stepIndex} className="animate-fade-in">
              {STEPS[stepIndex]}
            </span>
          </>
        ) : (
          <>
            <Sparkles className="size-5" />
            {allAnswered ? "בקשת אבחון" : `עוד ${QUESTIONS.length - answeredCount} תשובות`}
          </>
        )}
      </button>

      {!loading && (
        <p className="text-center text-xs text-muted">
          האבחון עובר קודם אצלנו לבדיקה, ורק אז תקבלי אותו.
        </p>
      )}
    </form>
  );
}
