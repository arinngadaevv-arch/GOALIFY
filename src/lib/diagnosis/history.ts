import {
  MOVE_CHANNEL_LABELS,
  OUTCOME_RESULT_LABELS,
  POSITIVE_RESULTS,
  type MoveChannel,
  type OutcomeResult,
} from "./types";

/** Closed loops fed to the model. Older ones drop off: the prompt should carry
 * what this business recently learned, not its entire archive. */
const MAX_LOOPS_IN_PROMPT = 8;

/** A past decision plus what actually happened to it. */
export type PriorLoop = {
  sentAt: Date | null;
  createdAt: Date;
  diagnosis: string;
  moveChannel: MoveChannel;
  moveDescription: string;
  falsificationCriteria: string;
  didExecute: boolean | null;
  result: OutcomeResult | null;
  resultNote: string | null;
};

export type ChannelRecord = {
  channel: MoveChannel;
  /** Times the owner actually did a move on this channel. */
  executed: number;
  /** Of those, how many produced a concrete positive result. */
  worked: number;
};

export type TrackRecord = {
  /** Oldest first, capped at MAX_LOOPS_IN_PROMPT - the order the prompt reads
   * them in. The counts below cover the full history, not just these. */
  loops: PriorLoop[];
  /** Every loop the record was folded from, including ones not listed. */
  totalLoops: number;
  /** Loops that actually test a hypothesis: executed and with a reported result. */
  measured: number;
  worked: number;
  byChannel: ChannelRecord[];
  /** Most recent consecutive sent moves the owner did not execute. High values
   * mean the moves are too heavy, which says nothing about the diagnoses. */
  unexecutedStreak: number;
};

/**
 * Folds a business's own closed loops into the record the next diagnosis is
 * allowed to reason from. `loops` must be newest-first (the natural
 * `orderBy(desc(createdAt))` order); the result is oldest-first.
 *
 * Executed-but-unmeasured and never-executed loops are deliberately kept out of
 * `measured`/`worked`: a move the owner never did tells us about friction, not
 * about whether the diagnosis was right.
 */
export function buildTrackRecord(loops: PriorLoop[]): TrackRecord {
  let unexecutedStreak = 0;
  for (const loop of loops) {
    if (loop.didExecute === false) unexecutedStreak += 1;
    else break;
  }

  const recent = loops.slice(0, MAX_LOOPS_IN_PROMPT).reverse();

  const measuredLoops = loops.filter(
    (loop) => loop.didExecute === true && loop.result !== null
  );

  const byChannelMap = new Map<MoveChannel, ChannelRecord>();
  for (const loop of loops) {
    if (loop.didExecute !== true) continue;
    const record = byChannelMap.get(loop.moveChannel) ?? {
      channel: loop.moveChannel,
      executed: 0,
      worked: 0,
    };
    record.executed += 1;
    if (POSITIVE_RESULTS.has(loop.result ?? "")) record.worked += 1;
    byChannelMap.set(loop.moveChannel, record);
  }

  return {
    loops: recent,
    totalLoops: loops.length,
    measured: measuredLoops.length,
    worked: measuredLoops.filter((loop) => POSITIVE_RESULTS.has(loop.result ?? ""))
      .length,
    byChannel: [...byChannelMap.values()].sort((a, b) => b.executed - a.executed),
    unexecutedStreak,
  };
}

function loopLine(loop: PriorLoop, index: number): string {
  const date = new Date(loop.sentAt ?? loop.createdAt).toLocaleDateString("he-IL");

  let outcome: string;
  if (loop.didExecute === true) {
    outcome = loop.result
      ? `בוצע. תוצאה שדווחה: ${OUTCOME_RESULT_LABELS[loop.result]}`
      : "בוצע, אך התוצאה עדיין לא דווחה - אין ממנו מסקנה על האבחנה";
  } else if (loop.didExecute === false) {
    outcome = "לא בוצע בפועל - לכן אי אפשר להסיק ממנו שהאבחנה היתה שגויה";
  } else {
    outcome = "אין דיווח - אין ממנו מסקנה";
  }

  return `${index + 1}. [${date}] אבחנה: ${loop.diagnosis}
   מהלך: ${loop.moveDescription} (ערוץ: ${MOVE_CHANNEL_LABELS[loop.moveChannel]})
   קריטריון ההפרכה שנכתב מראש: ${loop.falsificationCriteria}
   מה קרה: ${outcome}${loop.resultNote ? ` - בלשונה: "${loop.resultNote}"` : ""}`;
}

/**
 * Renders the track record as the Hebrew prompt block. Returns null when the
 * business has no history at all, so the caller can say so explicitly instead
 * of handing the model an empty section it might fill in from imagination.
 */
export function trackRecordBlock(record: TrackRecord): string | null {
  if (record.loops.length === 0) return null;

  const lines = record.loops.map(loopLine).join("\n\n");

  // The counts below span the whole history, so say when the list doesn't.
  const truncated =
    record.totalLoops > record.loops.length
      ? `(מוצגים ${record.loops.length} המהלכים האחרונים מתוך ${record.totalLoops}. המספרים בסיכום מתייחסים לכל ההיסטוריה.)\n\n`
      : "";

  const summary =
    record.measured === 0
      ? "עדיין אין אף מהלך שגם בוצע וגם דווחה עליו תוצאה - כלומר אין עדיין ולו בדיקה אחת שהושלמה."
      : `${record.measured} מהלכים בוצעו ודווחה עליהם תוצאה, ${record.worked} מתוכם הביאו תוצאה חיובית ממשית.`;

  const channels = record.byChannel
    .map(
      (c) =>
        `${MOVE_CHANNEL_LABELS[c.channel]}: בוצע ${c.executed}, עבד ${c.worked}`
    )
    .join(" | ");

  const frictionNote =
    record.unexecutedStreak >= 2
      ? `\n\nשים לב: ${record.unexecutedStreak} המהלכים האחרונים ברצף לא בוצעו בפועל. זו עדות על חיכוך ביצוע - לא על טעות באבחנה. המהלך הפעם חייב להיות קטן, קונקרטי וקצר משמעותית ממה שהוצע קודם.`
      : "";

  return `## ההיסטוריה האמיתית של העסק הזה
${truncated}${lines}

סיכום: ${summary}${channels ? `\nלפי ערוץ: ${channels}` : ""}${frictionNote}`;
}
