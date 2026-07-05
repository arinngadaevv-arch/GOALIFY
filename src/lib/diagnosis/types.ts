export type MoveType = "EXPLOIT" | "EXPLORE";
export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";
export type MoveChannel =
  | "REEL"
  | "STORY"
  | "DM_OUTREACH"
  | "CALL"
  | "PRICE_CHANGE"
  | "REPLY_TO_COMMENTS"
  | "NONE"
  | "OTHER";

/** Step 1 - self-reported vital signs. Collected as tapped qualitative bands
 * (see checkin-form), stored as fuzzy Hebrew phrases: real answers are fuzzy
 * ("אני לא בודקת כל יום"), and forcing precise numbers would just invite invented
 * precision. The model works with what's actually given - still plain strings. */
export interface BusinessSignals {
  exposureThisWeek: string;
  inquiriesThisWeek: string;
  closingsThisWeek: string;
  emptySlotsThisWeek: string;
  returningVsNewCustomers: string;
  recentAnomaly: string; // promotion, holiday, price change, or "none"
}

export interface AlternativeConsidered {
  hypothesis: string;
  whyRejected: string;
}

/** A Draft produced by Claude - never shown to the business owner until a human
 * approves it (see decisions.status: DRAFT -> APPROVED -> SENT). */
export interface DiagnosisDraft {
  diagnosis: string;
  confidence: ConfidenceLevel;
  confidenceReasoning: string;
  evidence: string[];
  alternativesConsidered: AlternativeConsidered[]; // [] is valid - means none genuinely considered
  moveType: MoveType;
  moveChannel: MoveChannel;
  moveDescription: string;
  /** Ready-to-use asset for the move: the actual DM text, reel hook + caption,
   * or call script the owner can copy and use. null when the channel has no
   * asset or on a quiet day. */
  executionAsset: string | null;
  estimatedMinutes: number | null;
  falsificationCriteria: string;
  /** true when no real edge was found - the app must show the quiet-day message,
   * never fabricate a move to keep up appearances. */
  noMoveToday: boolean;
}

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  LOW: "נמוך",
  MEDIUM: "בינוני",
  HIGH: "גבוה",
};

export const MOVE_CHANNEL_LABELS: Record<MoveChannel, string> = {
  REEL: "ריל",
  STORY: "סטורי",
  DM_OUTREACH: "הודעה אישית ללקוחות",
  CALL: "שיחת טלפון",
  PRICE_CHANGE: "שינוי תמחור",
  REPLY_TO_COMMENTS: "מענה לתגובות/הודעות",
  NONE: "ללא פעולה",
  OTHER: "אחר",
};
