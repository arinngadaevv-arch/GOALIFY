import { z } from "zod";
import { generateStructuredJson } from "@/lib/ai/client";
import type { BusinessSignals, DiagnosisDraft } from "./types";

const alternativeSchema = z.object({
  hypothesis: z.string(),
  whyRejected: z.string(),
});

const draftSchema = z.object({
  diagnosis: z.string(),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
  confidenceReasoning: z.string(),
  evidence: z.array(z.string()), // may be [] on a genuine quiet day
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
  executionAsset: z.string().nullable(),
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

## הנכס המוכן (executionAsset) - זה הערך האמיתי
אל תסתפק בלהגיד "שלחי הודעה" או "העלי ריל". תן לה את הדבר עצמו, מוכן להעתקה ושימוש מיד:
- הודעה אישית / DM: כתוב את נוסח ההודעה המלא, בגוף ראשון, בעברית טבעית וחמה, מותאם לעסק - כך שהיא רק מעתיקה ושולחת.
- Reel / Story: תן הוק פותח חזק בשורה הראשונה, ואז ראשי פרקים קצרים למה לצלם, וכיתוב (caption) מוכן.
- שיחת טלפון: תן פתיח קצר וטבעי + 2-3 נקודות לומר.
- שינוי מחיר / בדיקה: תן את המסר המדויק להעביר ללקוחות, אם רלוונטי.
הנכס חייב להיות ספציפי לעסק ולאבחנה - לא תבנית גנרית. אם הערוץ הוא NONE או שאין באמת נכס מוכן שאפשר לתת, החזר executionAsset=null. לעולם אל תמציא נכס סתם כדי למלא שדה.

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

תמיד השב בעברית, ותמיד החזר JSON מובנה בדיוק לפי הסכמה שסופקה.`;

const DRAFT_JSON_SCHEMA = {
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
    executionAsset: {
      anyOf: [{ type: "string" }, { type: "null" }],
      description:
        "הנכס המוכן לביצוע: נוסח ההודעה/הוק+כיתוב/תסריט השיחה, מותאם לעסק. null אם אין נכס רלוונטי.",
    },
    estimatedMinutes: { anyOf: [{ type: "number" }, { type: "null" }] },
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
    "executionAsset",
    "estimatedMinutes",
    "falsificationCriteria",
    "noMoveToday",
  ],
};

export async function generateDiagnosisDraft(
  signals: BusinessSignals,
  businessContext: { name: string; niche: string; reachNotes: string | null }
): Promise<DiagnosisDraft> {
  const prompt = `עסק: ${businessContext.name} (${businessContext.niche})
דרכי יצירת קשר עם לקוחות קיימים: ${businessContext.reachNotes || "לא ידוע - ציין זאת אם המהלך דורש זאת"}

סימנים חיוניים השבוע:
${signalsBlock(signals)}

אבחן את צוואר הבקבוק והפק Decision Draft מלא.`;

  const parsed = await generateStructuredJson({
    systemInstruction: SYSTEM_PROMPT,
    prompt,
    jsonSchema: DRAFT_JSON_SCHEMA,
    maxOutputTokens: 4000,
  });

  return draftSchema.parse(parsed);
}
