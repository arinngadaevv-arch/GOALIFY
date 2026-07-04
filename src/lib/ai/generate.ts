import { z } from "zod";
import { getAnthropicClient, CLAUDE_MODEL } from "./client";
import {
  BusinessInput,
  GeneratedContentResult,
  WeeklyPlanResult,
  TONE_LABELS,
  PLATFORM_LABELS,
} from "./types";

const videoIdeaSchema = z.object({
  title: z.string(),
  concept: z.string(),
  viralityScore: z.number().min(1).max(100),
  viralityReason: z.string(),
});

const videoScriptSchema = z.object({
  title: z.string(),
  hook: z.string(),
  durationSeconds: z.number().min(15).max(30),
  scriptBody: z.string(),
  shotBreakdown: z.array(z.string()).min(3),
  caption: z.string(),
  hashtags: z.array(z.string()).min(3),
  cta: z.string(),
  viralityScore: z.number().min(1).max(100),
  viralityReason: z.string(),
});

const generatedContentSchema = z.object({
  ideas: z.array(videoIdeaSchema).length(5),
  scripts: z.array(videoScriptSchema).length(3),
});

const weeklyPlanSchema = z.object({
  days: z
    .array(
      z.object({
        dayIndex: z.number().min(0).max(6),
        idea: z.string(),
        contentType: z.enum(["VIDEO", "IMAGE", "REEL"]),
        goal: z.enum(["REACH", "SALES", "ENGAGEMENT"]),
      })
    )
    .length(7),
});

function businessContextBlock(input: BusinessInput): string {
  return `
פרטי העסק:
- סוג העסק: ${input.businessType}
- תיאור המוצר/שירות: ${input.description}
- קהל היעד: ${input.targetAudience}
- סגנון כתיבה מבוקש: ${TONE_LABELS[input.tone]}
- פלטפורמה: ${PLATFORM_LABELS[input.platform]}
`.trim();
}

const SYSTEM_PROMPT = `אתה TrendSpark AI - אסטרטג תוכן ויראלי בכיר שמתמחה בטיקטוק ואינסטגרם עבור עסקים קטנים.
אתה כותב בעברית טבעית, שוטפת ומדוברת, בדיוק כמו קריאייטורים מובילים בישראל.
המטרה שלך היא להפיק תוכן ספציפי, יצירתי ובלתי צפוי - לעולם לא כללי, גנרי או שטחי.
כל רעיון חייב להיות מותאם באופן ספציפי לעסק, לקהל היעד ולסגנון הכתיבה שהתבקש - לא תבנית גנרית שמתאימה לכל עסק.
התבסס על מגמות, פורמטים וטכניקות ויראליות אמיתיות (POV, לפני/אחרי, טרנד סאונד, סטוריטלינג, אתגר, "יום בחיים", שאלה פרובוקטיבית ועוד) והתאם אותן ספציפית לעסק.
ציון הוויראליות (1-100) חייב לשקף הערכה כנה ומבוססת - לא כל רעיון מקבל ציון גבוה. תן ציונים מגוונים ותסביר בקצרה ובאופן משכנע מדוע רעיון עשוי לעבוד (הוק חזק, רגש, טרנד רלוונטי, פשטות ביצוע וכו').
תמיד תשתמש בכלי שסופק לך כדי להחזיר את התשובה במבנה JSON מדויק.`;

export async function generateContentIdeas(
  input: BusinessInput
): Promise<GeneratedContentResult> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `${businessContextBlock(input)}

הפק חבילת תוכן ויראלי מלאה עבור העסק הזה:

1. 5 רעיונות שונים לסרטונים ויראליים (זוויות/פורמטים שונים לגמרי אחד מהשני, לא חזרות על אותו רעיון).
2. עבור 3 מתוך הרעיונות (הכי חזקים), כתוב תסריט מלא לסרטון באורך 15-30 שניות, הכולל:
   - Hook: משפט פתיחה חזק ל-3 השניות הראשונות שעוצר גלילה
   - scriptBody: תסריט מלא - מה נאמר/קורה מרגע לרגע
   - shotBreakdown: פירוק צילום שלב-אחר-שלב - מה בדיוק מצלמים בפועל (זווית מצלמה, מה קורה בפריים, תזוזה)
   - caption: כיתוב לפוסט שמותאם למקסימום אנגייג'מנט (כולל שאלה או קריאה לתגובות כשרלוונטי)
   - hashtags: 8-12 האשטגים רלוונטיים וטרנדיים (בעברית ובאנגלית לפי הצורך)
   - cta: קריאה לפעולה ברורה בסוף הסרטון
   - ציון ויראליות (1-100) והסבר קצר

חשוב מאוד: הימנע מרעיונות כלליים שיכולים להתאים לכל עסק. כל רעיון ותסריט חייבים להרגיש כאילו נכתבו במיוחד עבור העסק הספציפי הזה.`,
      },
    ],
    tools: [
      {
        name: "submit_content_package",
        description: "מגיש חבילת תוכן ויראלי מובנית עבור העסק",
        input_schema: {
          type: "object",
          properties: {
            ideas: {
              type: "array",
              minItems: 5,
              maxItems: 5,
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  concept: { type: "string" },
                  viralityScore: { type: "number" },
                  viralityReason: { type: "string" },
                },
                required: [
                  "title",
                  "concept",
                  "viralityScore",
                  "viralityReason",
                ],
              },
            },
            scripts: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  hook: { type: "string" },
                  durationSeconds: { type: "number" },
                  scriptBody: { type: "string" },
                  shotBreakdown: {
                    type: "array",
                    items: { type: "string" },
                  },
                  caption: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } },
                  cta: { type: "string" },
                  viralityScore: { type: "number" },
                  viralityReason: { type: "string" },
                },
                required: [
                  "title",
                  "hook",
                  "durationSeconds",
                  "scriptBody",
                  "shotBreakdown",
                  "caption",
                  "hashtags",
                  "cta",
                  "viralityScore",
                  "viralityReason",
                ],
              },
            },
          },
          required: ["ideas", "scripts"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_content_package" },
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return structured content");
  }

  return generatedContentSchema.parse(toolUse.input);
}

export async function generateWeeklyPlan(
  input: BusinessInput
): Promise<WeeklyPlanResult> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `${businessContextBlock(input)}

בנה תוכנית תוכן שבועית (7 ימים, ראשון עד שבת, dayIndex 0-6 כאשר 0=ראשון) עבור העסק הזה.
לכל יום ציין:
- idea: רעיון ספציטי ומגוון לפוסט (לא חזרות)
- contentType: VIDEO / IMAGE / REEL - הכי מתאים לרעיון
- goal: REACH / SALES / ENGAGEMENT - המטרה העיקרית של הפוסט

חשוב: פזר בין המטרות השונות במהלך השבוע (לא כל הפוסטים לאותה מטרה), וודא שהרעיונות מגוונים ומחוברים לעסק הספציפי.`,
      },
    ],
    tools: [
      {
        name: "submit_weekly_plan",
        description: "מגיש תוכנית תוכן שבועית מובנית",
        input_schema: {
          type: "object",
          properties: {
            days: {
              type: "array",
              minItems: 7,
              maxItems: 7,
              items: {
                type: "object",
                properties: {
                  dayIndex: { type: "number" },
                  idea: { type: "string" },
                  contentType: {
                    type: "string",
                    enum: ["VIDEO", "IMAGE", "REEL"],
                  },
                  goal: {
                    type: "string",
                    enum: ["REACH", "SALES", "ENGAGEMENT"],
                  },
                },
                required: ["dayIndex", "idea", "contentType", "goal"],
              },
            },
          },
          required: ["days"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_weekly_plan" },
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a structured weekly plan");
  }

  return weeklyPlanSchema.parse(toolUse.input);
}
