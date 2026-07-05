"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
};

const SUGGESTIONS = [
  "מה עבד הכי טוב אצלי עד עכשיו?",
  "כמה מהלכים באמת ביצעתי?",
  "מה הסטטוס של המהלך האחרון?",
];

export function BusinessChat({ businessId }: { businessId: string }) {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingIdCounter = useRef(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/businesses/${businessId}/chat`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setMessages(data.messages ?? []);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setError(null);
    setSending(true);
    // Optimistic append so the question appears immediately.
    pendingIdCounter.current += 1;
    const optimisticId = `pending-${pendingIdCounter.current}`;
    setMessages((prev) => [
      ...(prev ?? []),
      { id: optimisticId, role: "USER", content: trimmed },
    ]);
    setInput("");

    try {
      const res = await fetch(`/api/businesses/${businessId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "משהו השתבש, נסו שוב");
        setMessages((prev) => (prev ?? []).filter((m) => m.id !== optimisticId));
        setSending(false);
        return;
      }
      setMessages((prev) => [
        ...(prev ?? []).filter((m) => m.id !== optimisticId),
        data.userMessage,
        data.assistantMessage,
      ]);
      setSending(false);
    } catch {
      setError("משהו השתבש, נסו שוב");
      setMessages((prev) => (prev ?? []).filter((m) => m.id !== optimisticId));
      setSending(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  const isEmpty = messages !== null && messages.length === 0;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface/60 p-5">
      <div className="flex items-center gap-2 text-sm font-bold">
        <MessageCircle className="size-4 text-neon-purple" />
        שאלי אותי על הנתונים שלך
      </div>
      <p className="mt-1 text-xs text-muted">
        שואלים על ההיסטוריה האמיתית שלכם בלבד - לא ייעוץ כללי.
      </p>

      <div className="mt-4 max-h-96 min-h-[6rem] space-y-3 overflow-y-auto">
        {messages === null && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <Loader2 className="size-3.5 animate-spin" />
            טוען שיחה...
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted transition-colors hover:border-neon-purple/50 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages?.map((m) => (
          <div
            key={m.id}
            className={`animate-fade-in-up flex ${m.role === "USER" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "USER"
                  ? "gradient-brand text-white"
                  : "bg-surface-2 text-foreground"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-end">
            <div className="flex items-center gap-1.5 rounded-2xl bg-surface-2 px-3.5 py-2.5 text-sm text-muted">
              <Loader2 className="size-3.5 animate-spin" />
              חושב...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="שאלי משהו על העסק שלך..."
          maxLength={1000}
          disabled={sending}
          className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-neon-purple disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="grid size-10 shrink-0 place-items-center rounded-full gradient-brand text-white disabled:opacity-50"
          aria-label="שליחה"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
