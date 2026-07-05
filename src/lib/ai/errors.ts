import { z } from "zod";

/**
 * Turns an AI-generation failure into a specific, actionable Hebrew message.
 * The whole point: when the Gemini call fails in production, the owner (and
 * we) should see *why* - bad key, wrong model, quota, billing - not an opaque
 * "try again". The Gemini SDK's ApiError carries a numeric `.status`.
 */
export function diagnosisErrorMessage(
  error: unknown,
  fallback = "יצירת האבחון נכשלה. נסו שוב בעוד רגע."
): string {
  if (
    error instanceof Error &&
    error.message.includes("GEMINI_API_KEY is not set")
  ) {
    return "החיבור ל-AI לא הוגדר (חסר מפתח API בהגדרות השרת).";
  }

  const status = (error as { status?: number } | undefined)?.status;
  const message = error instanceof Error ? error.message : "";

  // Verified against a real call: Gemini returns an invalid key as a 400
  // INVALID_ARGUMENT ("API key not valid..."/"API_KEY_INVALID") - not 401/403
  // like most providers, so this has to be checked before the generic 400s.
  if (status === 400 && /api key/i.test(message)) {
    return "מפתח ה-API של ה-AI שגוי או לא פעיל. יש לעדכן אותו בהגדרות השרת.";
  }
  // Gemini API keys not yet linked to a billing account surface as a 400
  // with "billing" in the message - a billing state, not an auth problem.
  if (status === 400 && /billing/i.test(message)) {
    return "חשבון ה-AI לא מקושר לחיוב פעיל. יש להפעיל חיוב (billing) בחשבון Google AI Studio / Gemini API.";
  }
  if (status === 401 || status === 403) {
    return "מפתח ה-API של ה-AI שגוי או לא פעיל, או שאין לו הרשאה למודל. יש לבדוק את ההרשאות בהגדרות השרת.";
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

  return fallback;
}
