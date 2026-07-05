import { Target } from "lucide-react";

/**
 * A real-looking (static) preview of the "Today's Move" card the owner
 * actually sees after check-in. Lets a visitor feel the product in the hero
 * instead of reading abstract feature bullets.
 */
export function HeroDecisionMock() {
  return (
    <div className="gradient-border glow-pink mx-auto max-w-md rounded-2xl bg-surface p-5 text-right shadow-2xl">
      <div className="flex items-center gap-2 text-xs font-bold text-neon-pink">
        <Target className="size-3.5" />
        המהלך של היום
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">
        צוואר הבקבוק הוא הסגירה: יש פניות אבל הן לא הופכות לתורים.
      </p>

      <div className="mt-3.5 rounded-xl bg-surface-2 p-3.5">
        <p className="text-sm font-medium leading-relaxed">
          שלחי הודעה אישית לכל מי שפנתה השבוע ולא קבעה, עם הצעת תור קונקרטית.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-400">
            ביטחון: בינוני
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
            15 דק&apos;
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        למה זה המהלך? שלושה סימנים תומכים: פניות קיימות, סגירות אפס, יומן ריק.
      </p>
    </div>
  );
}
