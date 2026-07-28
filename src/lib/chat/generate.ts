import { generateText, type ChatTurn } from "@/lib/ai/client";
import {
  CONFIDENCE_LABELS,
  MOVE_CHANNEL_LABELS,
  OUTCOME_RESULT_LABELS,
  type ConfidenceLevel,
  type MoveChannel,
  type OutcomeResult,
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
    result: OutcomeResult | null;
    followupAnsweredAt: Date | null;
  } | null;
};

function decisionsBlock(decisions: DecisionContext[]): string {
  if (decisions.length === 0) return "(עדיין אין החלטות שנשלחו לעסק הזה.)";

  return decisions
    .map((d, i) => {
      const date = new Date(d.createdAt).toLocaleDateString("he-IL");
      const outcomeText = d.outcome
        ? `${d.outcome.didExecute ? "בוצע" : "לא בוצע"}${
            d.outcome.result
              ? ` - תוצאה: ${OUTCOME_RESULT_LABELS[d.outcome.result]}`
              : ""
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
  const systemInstruction = `${SYSTEM_PROMPT}

עסק: ${business.name} (${business.niche})

היסטוריית האבחונים וההחלטות האמיתית של העסק הזה:
${decisionsBlock(decisions)}`;

  const turns: ChatTurn[] = [
    ...history.map((m) => ({
      role: m.role === "USER" ? ("user" as const) : ("model" as const),
      text: m.content,
    })),
    { role: "user", text: userMessage },
  ];

  return generateText({ systemInstruction, history: turns, maxOutputTokens: 1024 });
}
