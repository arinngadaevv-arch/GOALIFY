/**
 * The daily creed bank — deliberately blunt, no-excuses lines in the same
 * voice the app's workout copy already uses.
 *
 * Selection is derived from the date, not `Math.random()`: the same day
 * always yields the same line, so it can't reshuffle on every re-render or
 * differ between the server and client render (which would hydrate-mismatch),
 * and it genuinely reads as "today's line" rather than a slot machine.
 */

export type Creed = {
  /** The punch — short enough to land in one glance. */
  line: string;
  /** The quieter follow-through underneath it. */
  sub: string;
};

const CREEDS: Creed[] = [
  {
    line: "NO ZERO DAYS",
    sub: "Twenty-four minutes beats a perfect plan you never start.",
  },
  {
    line: "DISCIPLINE OVER MOTIVATION",
    sub: "Motivation shows up when it feels like it. Discipline shows up anyway.",
  },
  {
    line: "OUTWORK YESTERDAY",
    sub: "You're not competing with anyone else on this app. Only the version of you from yesterday.",
  },
  {
    line: "THE WORK IS THE POINT",
    sub: "Nobody gets the result without the reps. There is no shortcut being kept from you.",
  },
  {
    line: "SHOW UP TIRED",
    sub: "The sessions you do when you don't feel like it are the ones that actually change you.",
  },
  {
    line: "SORE TODAY, STRONG TOMORROW",
    sub: "That ache is the receipt. Keep it coming.",
  },
  {
    line: "EXCUSES DON'T BURN CALORIES",
    sub: "You already know what today needs. Go do it.",
  },
  {
    line: "SMALL REPS, COMPOUND RESULTS",
    sub: "One session changes nothing. A hundred sessions change everything.",
  },
  {
    line: "YOUR PLATE COUNTS TOO",
    sub: "You can't out-train what you eat. Fuel it like you mean it.",
  },
  {
    line: "CONSISTENCY IS THE CHEAT CODE",
    sub: "The people who get there aren't stronger. They just didn't stop.",
  },
  {
    line: "START BEFORE YOU'RE READY",
    sub: "Ready is a feeling that arrives after you begin, never before.",
  },
  {
    line: "PROTECT THE STREAK",
    sub: "Missing once is an accident. Missing twice is a new habit.",
  },
  {
    line: "COMFORT IS THE ENEMY",
    sub: "Nothing worth having sits inside the range you're already comfortable in.",
  },
  {
    line: "EARN IT TODAY",
    sub: "The body you want is downstream of the choices you make in the next hour.",
  },
];

/** Days since the epoch — stable for a whole calendar day in local time. */
function dayIndex(date: Date): number {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(local.getTime() / 86_400_000);
}

/** Today's creed. Rotates once per day, deterministically. */
export function creedForDay(date = new Date()): Creed {
  return CREEDS[((dayIndex(date) % CREEDS.length) + CREEDS.length) % CREEDS.length];
}

export const CREED_COUNT = CREEDS.length;
