import { MOVE_CHANNEL_LABELS, POSITIVE_RESULTS, type MoveChannel } from "./types";

type DecisionRow = { id: string; status: string; moveChannel: MoveChannel };
type OutcomeRow = {
  decisionId: string;
  didExecute: boolean | null;
  result: string | null;
  followupAnsweredAt: Date | null;
};

export type Insights = {
  /** Fully-closed loops the numbers are based on. */
  movesMeasured: number;
  /** Share of sent moves the owner actually did (0..1). */
  executionRate: number;
  /** Share of measured loops that produced a real result (0..1). */
  positiveRate: number;
  /** The channel that most often led to a real result, or null if none did yet. */
  bestChannelLabel: string | null;
};

/**
 * Honest aggregations over the real decision/outcome stream - never fabricated.
 * Returns null until there are at least a few measured loops, so we never
 * present a "pattern" we can't actually stand behind (the Track Record rule).
 */
export function computeInsights(
  decisions: DecisionRow[],
  outcomes: OutcomeRow[]
): Insights | null {
  const sent = decisions.filter((d) => d.status === "SENT");
  const outcomeByDecision = new Map(outcomes.map((o) => [o.decisionId, o]));

  const measured = sent.filter(
    (d) => outcomeByDecision.get(d.id)?.followupAnsweredAt
  );
  if (measured.length < 2) return null;

  const executedCount = sent.filter(
    (d) => outcomeByDecision.get(d.id)?.didExecute
  ).length;

  const positiveCount = measured.filter((d) =>
    POSITIVE_RESULTS.has(outcomeByDecision.get(d.id)?.result ?? "")
  ).length;

  const channelTally = new Map<MoveChannel, number>();
  for (const d of measured) {
    const o = outcomeByDecision.get(d.id);
    if (o && POSITIVE_RESULTS.has(o.result ?? "")) {
      channelTally.set(d.moveChannel, (channelTally.get(d.moveChannel) ?? 0) + 1);
    }
  }

  let bestChannel: MoveChannel | null = null;
  let bestCount = 0;
  for (const [channel, count] of channelTally) {
    if (count > bestCount) {
      bestCount = count;
      bestChannel = channel;
    }
  }

  return {
    movesMeasured: measured.length,
    executionRate: sent.length ? executedCount / sent.length : 0,
    positiveRate: positiveCount / measured.length,
    bestChannelLabel: bestChannel ? MOVE_CHANNEL_LABELS[bestChannel] : null,
  };
}
