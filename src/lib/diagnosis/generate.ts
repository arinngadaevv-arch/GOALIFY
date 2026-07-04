import { z } from "zod";
import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/ai/client";
import type { BusinessSignals, DiagnosisDraft } from "./types";

const alternativeSchema = z.object({
  hypothesis: z.string(),
  whyRejected: z.string(),
});

const draftSchema = z.object({
  diagnosis: z.string(),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
  confidenceReasoning: z.string(),
  evidence: z.array(z.string()).min(1),
  alternativesConsidered: z.array(alternativeSchema), // [] is valid
  moveType: z.enum(["EXPLOIT", "EXPLORE"]),
  moveChannel: z.enum([
    "REEL",
    "STORY",
    "DM_OUTREACH",
    "CALL",
    "PRICE_CHANGE",
    "REPLY_TO_COMMENTS",
    "NONE",
    "OTHER",
  ]),
  moveDescription: z.string(),
  estimatedMinutes: z.number().nullable(),
  falsificationCriteria: z.string(),
  noMoveToday: z.boolean(),
});

function signalsBlock(signals: BusinessSignals): string {
  return `
חשיפה השבוע: ${signals.exposureThisWeek}
פניות השבוע: ${signals.inquiriesThisWeek}
סגירות השבוע: ${signals.closingsThisWeek}
כיסאות/תורים ריקים השבוע: ${signals.emptySlotsThisWeek}
לקוחות חוזרים מול חדשים: ${signals.returningVsNewCustomers}
אירוע חריג לאחרונה: ${signals.recentAnomaly}
`.trim();
}

const SYSTEM_PROMPT = `אתה אנליסט עסקי בכיר שמאבחן את צוואר הבקבוק היחיד שמעכב עסק קטן היום, ונותן מהלך אחד.

## איך אתה חושב
אתה לא שואל "איזה תוכן ליצור". אתה שואל "מה מונע מהעסק הזה להתקדם היום".
השרשרת: חשיפה -> פניות -> סגירות -> הגעות -> חזרות, בתוספת כיסאות/תורים ריקים השבוע.
צוואר הבקבוק הוא החוליה הראשונה שנשברת בשרשרת הזו - לא בהכרח החוליה הראשונה שהוזכרה.
אם יותר מחוליה אחת נראית שבורה בו-זמנית, ואין לך דרך אמיתית להכריע ביניהן מהנתונים - הורד את הביטחון ל-LOW ואמור זאת בפירוש ב-confidenceReasoning, אל תבחר שרירותית.

## המהלך
המהלך משרת את המטרה העסקית (יומן מלא, יותר לקוחות, יותר הכנסה) - הוא לא בהכרח תוכן.
לפעמים זה Reel, לפעמים Story, לפעמים הודעה אישית ללקוחות קיימים, לפעמים שיחת טלפון, לפעמים בדיקת תמחור, ולפעמים אין בכלל מהלך היום.
בחר את הערוץ (moveChannel) רק אחרי שקבעת את האבחנה - האבחנה קודמת לפעולה, לא להיפך.

## Exploit מול Explore
אם האבחנה מבוססת על ידע קודם וחוזר (moveType=EXPLOIT), אמור זאת. אם זו השערה שטרם נבדקה אצל העסק הזה (moveType=EXPLORE), אמור זאת גם - וזה תקין ואף רצוי, אך חייב להיות שקוף.

## ביטחון - האיסור הקדוש
לעולם אל תציג ביטחון שאין לך. confidence הוא איכותי (LOW/MEDIUM/HIGH) ולא אחוז מומצא - כי אין לנו עדיין מספיק היסטוריה כדי לכייל אחוזים אמיתיים.
כל confidence חייב נימוק אמיתי ב-confidenceReasoning: כמה מהסימנים תומכים, האם זו הפעם הראשונה שנבדק דבר כזה אצל העסק הזה.

## חלופות - בלי המצאות
alternativesConsidered חייב לשקף חלופות שבאמת שקלת ופסלת. אם באמת אין חלופה סבירה אחרת - החזר מערך ריק. אסור להמציא חלופת קש רק כדי למלא שדה.

## הפרכה
falsificationCriteria חייב להיות כתוב מראש, לפני שידוע מה קרה בפועל: מה אתה מצפה שיקרה, ואיך תדע אם טעית באבחנה.

## יום שקט
אם באמת אין לך אבחנה אמינה מהנתונים שסופקו - החזר noMoveToday=true עם הסבר קצר ב-diagnosis למה, ושאר השדות יכולים להיות מינימליים. אל תמציא מהלך רק כדי "שיהיה תוכן".

תמיד השב בעברית, ותמיד השתמש בכלי שסופק כדי להחזיר JSON מובנה.`;

export async function generateDiagnosisDraft(
  signals: BusinessSignals,
  businessContext: { name: string; niche: string; reachNotes: string | null }
): Promise<DiagnosisDraft> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `עסק: ${businessContext.name} (${businessContext.niche})
דרכי יצירת קשר עם לקוחות קיימים: ${businessContext.reachNotes || "לא ידוע - ציין זאת אם המהלך דורש זאת"}

סימנים חיוניים השבוע:
${signalsBlock(signals)}

אבחן את צוואר הבקבוק והפק Decision Draft מלא.`,
      },
    ],
    tools: [
      {
        name: "submit_decision_draft",
        description: "מגיש טיוטת החלטה מובנית (Diagnosis + Move + Confidence + Falsification)",
        input_schema: {
          type: "object",
          properties: {
            diagnosis: { type: "string" },
            confidence: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
            confidenceReasoning: { type: "string" },
            evidence: { type: "array", items: { type: "string" } },
            alternativesConsidered: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  hypothesis: { type: "string" },
                  whyRejected: { type: "string" },
                },
                required: ["hypothesis", "whyRejected"],
              },
            },
            moveType: { type: "string", enum: ["EXPLOIT", "EXPLORE"] },
            moveChannel: {
              type: "string",
              enum: [
                "REEL",
                "STORY",
                "DM_OUTREACH",
                "CALL",
                "PRICE_CHANGE",
                "REPLY_TO_COMMENTS",
                "NONE",
                "OTHER",
              ],
            },
            moveDescription: { type: "string" },
            estimatedMinutes: { type: ["number", "null"] },
            falsificationCriteria: { type: "string" },
            noMoveToday: { type: "boolean" },
          },
          required: [
            "diagnosis",
            "confidence",
            "confidenceReasoning",
            "evidence",
            "alternativesConsidered",
            "moveType",
            "moveChannel",
            "moveDescription",
            "estimatedMinutes",
            "falsificationCriteria",
            "noMoveToday",
          ],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_decision_draft" },
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a structured decision draft");
  }

  return draftSchema.parse(toolUse.input);
}
