import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env (see .env.example)."
    );
  }
  client = new GoogleGenAI({ apiKey });
  return client;
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Calls Gemini forcing a structured JSON response matching `jsonSchema`
 * (a plain JSON Schema object - see Gemini's supported-keyword subset),
 * and returns the parsed-but-unvalidated JSON. Callers validate the shape
 * with Zod, same as before - this only replaces the provider call itself.
 */
export async function generateStructuredJson(params: {
  systemInstruction: string;
  prompt: string;
  jsonSchema: unknown;
  maxOutputTokens?: number;
}): Promise<unknown> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: params.prompt,
    config: {
      systemInstruction: params.systemInstruction,
      responseMimeType: "application/json",
      responseJsonSchema: params.jsonSchema,
      maxOutputTokens: params.maxOutputTokens,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini did not return a structured response");
  }
  return JSON.parse(text);
}

export type ChatTurn = { role: "user" | "model"; text: string };

/** Calls Gemini for a plain-text multi-turn reply (no structured schema). */
export async function generateText(params: {
  systemInstruction: string;
  history: ChatTurn[];
  maxOutputTokens?: number;
}): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: params.history.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    })),
    config: {
      systemInstruction: params.systemInstruction,
      maxOutputTokens: params.maxOutputTokens,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini did not return a text reply");
  }
  return text;
}
