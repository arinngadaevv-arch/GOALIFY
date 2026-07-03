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

export function CheckinForm({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [fields, setFields] = useState({
    exposureThisWeek: "",
    inquiriesThisWeek: "",
    closingsThisWeek: "",
    emptySlotsThisWeek: "",
    returningVsNewCustomers: "",
    recentAnomaly: "",
  });
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function update(key: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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

  const inputs: { key: keyof typeof fields; label: string; placeholder: string }[] = [
    {
      key: "exposureThisWeek",
      label: "כמה חשיפה הייתה השבוע? (צפיות בסטורי/ריל)",
      placeholder: "לדוגמה: בערך כמו כל שבוע, לא בדקתי מספרים מדויקים",
    },
    {
      key: "inquiriesThisWeek",
      label: "כמה פניות אמיתיות מלקוחות פוטנציאליים היו השבוע?",
      placeholder: "לדוגמה: 2-3 הודעות ששאלו על טיפולים",
    },
    {
      key: "closingsThisWeek",
      label: "כמה מהפניות האלה הפכו לתור שנקבע?",
      placeholder: "לדוגמה: רק אחת מתוך זה",
    },
    {
      key: "emptySlotsThisWeek",
      label: "כמה תורים ריקים יש לך השבוע?",
      placeholder: "לדוגמה: שלישי ורביעי אחה״צ ריקים",
    },
    {
      key: "returningVsNewCustomers",
      label: "איך מרגיש היחס בין לקוחות חוזרות לחדשות לאחרונה?",
      placeholder: "לדוגמה: הרוב חוזרות, כמעט אין חדשות",
    },
    {
      key: "recentAnomaly",
      label: "קרה משהו חריג לאחרונה? (מבצע, חג, שינוי מחיר)",
      placeholder: "לדוגמה: כלום מיוחד / העליתי מחיר לפני חודש",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {inputs.map((input) => (
        <div key={input.key}>
          <label className="mb-1.5 block text-sm font-medium text-muted">
            {input.label}
          </label>
          <input
            required
            value={fields[input.key]}
            onChange={(e) => update(input.key, e.target.value)}
            placeholder={input.placeholder}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-neon-purple"
          />
        </div>
      ))}

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full gradient-brand px-6 py-4 text-base font-bold text-white shadow-xl shadow-pink-500/25 transition-transform hover:scale-[1.01] disabled:opacity-80 disabled:hover:scale-100"
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
            בקשת אבחון
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
