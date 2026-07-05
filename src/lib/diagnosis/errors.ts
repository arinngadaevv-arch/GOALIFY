import { z } from "zod";

/**
 * Turns a diagnosis-generation failure into a specific, actionable Hebrew
 * message. The whole point: when the Claude call fails in production, the owner
 * (and we) should see *why* - bad key, wrong model, quota - not an opaque
 * "try again". The Anthropic SDK throws errors carrying a numeric `.status`.
 */
export function diagnosisErrorMessage(error: unknown): string {
  if (
    error instanceof Error &&
    error.message.includes("ANTHROPIC_API_KEY is not set")
  ) {
    return "החיבור ל-AI לא הוגדר (חסר מפתח API בהגדרות השרת).";
  }

  const status = (error as { status?: number } | undefined)?.status;

  if (status === 401 || status === 403) {
    return "מפתח ה-API של ה-AI שגוי או לא פעיל. יש לעדכן אותו בהגדרות השרת.";
  }
  if (status === 404) {
    return "מודל ה-AI שמוגדר אינו נגיש לחשבון. יש לבדוק את שם המודל בהגדרות.";
  }
  if (status === 429) {
    return "נחצתה מכסת השימוש ב-AI. נסו שוב בעוד מספר דקות.";
  }
  if (typeof status === "number" && status >= 500) {
    return "שירות ה-AI עמוס כרגע. נסו שוב בעוד רגע.";
  }
  if (error instanceof z.ZodError) {
    return "התקבלה תשובה לא צפויה מה-AI. נסו שוב בעוד רגע.";
  }

  return "יצירת האבחון נכשלה. נסו שוב בעוד רגע.";
}
