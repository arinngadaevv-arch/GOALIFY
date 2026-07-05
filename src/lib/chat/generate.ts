import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/ai/client";
import {
  CONFIDENCE_LABELS,
  MOVE_CHANNEL_LABELS,
  type ConfidenceLevel,
  type MoveChannel,
} from "@/lib/diagnosis/types";

export type ChatHistoryMessage = { role: "USER" | "ASSISTANT"; content: string };

type DecisionContext = {
  createdAt: Date;
  status: string;
  diagnosis: string;
  confidence: ConfidenceLevel;
  confidenceReasoning: string;
  moveDescription: string;
  moveChannel: MoveChannel;
  falsificationCriteria: string;
  outcome: {
    didExecute: boolean | null;
    result: string | null;
    followupAnsweredAt: Date | null;
  } | null;
};

const RESULT_LABELS: Record<string, string> = {
  MORE_VIEWS: "יותר צפיות",
  MORE_MESSAGES: "יותר הודעות",
  MORE_COMMENTS: "יותר תגובות",
  NOTHING: "כלום מיוחד",
  OTHER: "משהו אחר",
};

function decisionsBlock(decisions: DecisionContext[]): string {
  if (decisions.length === 0) return "(עדיין אין החלטות שנשלחו לעסק הזה.)";

  return decisions
    .map((d, i) => {
      const date = new Date(d.createdAt).toLocaleDateString("he-IL");
      const outcomeText = d.outcome
        ? `${d.outcome.didExecute ? "בוצע" : "לא בוצע"}${
            d.outcome.result ? ` - תוצאה: ${RESULT_LABELS[d.outcome.result] ?? d.outcome.result}` : ""
          }${d.outcome.followupAnsweredAt ? "" : " (מחכה עדיין למעקב 48 שעות)"}`
        : "עדיין אין תוצאה מדווחת";

      return `${i + 1}. [${date}] אבחנה: ${d.diagnosis}
ביטחון: ${CONFIDENCE_LABELS[d.confidence]} (${d.confidenceReasoning})
המהלך: ${d.moveDescription} (ערוץ: ${MOVE_CHANNEL_LABELS[d.moveChannel]})
קריטריון הפרכה: ${d.falsificationCriteria}
תוצאה בפועל: ${outcomeText}`;
    })
    .join("\n\n");
}

const SYSTEM_PROMPT = `אתה עוזר שמסביר לבעלת עסק את הנתונים וההיסטוריה האמיתיים שלה במערכת TrendSpark AI.

## הכלל היחיד שאסור לשבור
אתה עונה אך ורק על סמך הנתונים שסופקו לך למטה - ההיסטוריה האמיתית של האבחונים, ההחלטות והתוצאות של העסק הזה.
אסור לך להמציא עצה עסקית חדשה, המלצה, או "תובנה" שלא מבוססת במפורש על הנתונים שסופקו.
אם נשאלת שאלה שהתשובה עליה לא נמצאת בנתונים - אמור בפירוש שאין לך מספיק מידע כדי לענות, ואל תנחש.
זה לא צ'אט ייעוץ עסקי כללי - זה כלי שחושף את מה שכבר ידוע, לא ממציא ידע חדש.

תמיד השב בעברית, בטון חם וישיר, בפסקאות קצרות.`;

export async function generateChatReply(
  business: { name: string; niche: string },
  decisions: DecisionContext[],
  history: ChatHistoryMessage[],
  userMessage: string
): Promise<string> {
  const anthropic = getAnthropicClient();

  const contextMessage = `עסק: ${business.name} (${business.niche})

היסטוריית האבחונים וההחלטות האמיתית של העסק הזה:
${decisionsBlock(decisions)}`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: contextMessage },
      { role: "assistant", content: "הבנתי את הנתונים. מה תרצי לדעת?" },
      ...history.map((m) => ({
        role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude did not return a text reply");
  }
  return textBlock.text;
}
