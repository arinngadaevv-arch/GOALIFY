export type ContentTone = "FUNNY" | "LUXURY" | "PROFESSIONAL" | "TRENDY";
export type ContentPlatform = "TIKTOK" | "INSTAGRAM" | "BOTH";
export type PlanDayContentType = "VIDEO" | "IMAGE" | "REEL";
export type PlanDayGoal = "REACH" | "SALES" | "ENGAGEMENT";

export interface BusinessInput {
  businessType: string;
  description: string;
  targetAudience: string;
  tone: ContentTone;
  platform: ContentPlatform;
}

export interface VideoIdea {
  title: string;
  concept: string;
  viralityScore: number;
  viralityReason: string;
}

export interface VideoScript {
  title: string;
  hook: string;
  durationSeconds: number;
  scriptBody: string;
  shotBreakdown: string[];
  caption: string;
  hashtags: string[];
  cta: string;
  viralityScore: number;
  viralityReason: string;
}

export interface GeneratedContentResult {
  ideas: VideoIdea[];
  scripts: VideoScript[];
}

export interface PlanDayItem {
  dayIndex: number;
  idea: string;
  contentType: PlanDayContentType;
  goal: PlanDayGoal;
}

export interface WeeklyPlanResult {
  days: PlanDayItem[];
}

export const TONE_LABELS: Record<ContentTone, string> = {
  FUNNY: "מצחיק",
  LUXURY: "יוקרתי",
  PROFESSIONAL: "מקצועי",
  TRENDY: "טרנדי",
};

export const PLATFORM_LABELS: Record<ContentPlatform, string> = {
  TIKTOK: "טיקטוק",
  INSTAGRAM: "אינסטגרם",
  BOTH: "טיקטוק ואינסטגרם",
};

export const CONTENT_TYPE_LABELS: Record<PlanDayContentType, string> = {
  VIDEO: "וידאו",
  IMAGE: "תמונה",
  REEL: "ריל",
};

export const GOAL_LABELS: Record<PlanDayGoal, string> = {
  REACH: "חשיפה",
  SALES: "מכירות",
  ENGAGEMENT: "מעורבות",
};
