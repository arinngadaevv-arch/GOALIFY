"use client";

import { useRef, useState } from "react";
import { Check, Copy, Download, Loader2 } from "lucide-react";
import type { GeneratedContentResult } from "@/lib/ai/types";
import {
  CONTENT_TYPE_LABELS,
  GOAL_LABELS,
  PLATFORM_LABELS,
  TONE_LABELS,
  type PlanDayContentType,
  type PlanDayGoal,
} from "@/lib/ai/types";

const DAY_LABELS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

interface ProjectLike {
  businessType: string;
  description: string;
  targetAudience: string;
  tone: keyof typeof TONE_LABELS;
  platform: keyof typeof PLATFORM_LABELS;
}

interface PlanDayLike {
  dayIndex: number;
  idea: string;
  contentType: PlanDayContentType;
  goal: PlanDayGoal;
}

function buildTextExport(
  project: ProjectLike,
  content: GeneratedContentResult,
  days: PlanDayLike[]
): string {
  const lines: string[] = [];
  lines.push(`TrendSpark AI - חבילת תוכן: ${project.businessType}`);
  lines.push(`קהל יעד: ${project.targetAudience}`);
  lines.push(`סגנון: ${TONE_LABELS[project.tone]} | פלטפורמה: ${PLATFORM_LABELS[project.platform]}`);
  lines.push("");
  lines.push("=== רעיונות לסרטונים ===");
  content.ideas.forEach((idea, i) => {
    lines.push(`${i + 1}. ${idea.title} (ויראליות: ${idea.viralityScore}/100)`);
    lines.push(`   ${idea.concept}`);
    lines.push(`   למה זה יעבוד: ${idea.viralityReason}`);
    lines.push("");
  });
  lines.push("=== תסריטים מלאים ===");
  content.scripts.forEach((script, i) => {
    lines.push(`--- תסריט ${i + 1}: ${script.title} (${script.durationSeconds} שנ', ויראליות: ${script.viralityScore}/100) ---`);
    lines.push(`Hook: ${script.hook}`);
    lines.push(`תסריט: ${script.scriptBody}`);
    lines.push(`פירוק צילום:`);
    script.shotBreakdown.forEach((shot, si) => lines.push(`  ${si + 1}. ${shot}`));
    lines.push(`כיתוב: ${script.caption}`);
    lines.push(`האשטגים: ${script.hashtags.join(" ")}`);
    lines.push(`CTA: ${script.cta}`);
    lines.push("");
  });
  if (days.length > 0) {
    lines.push("=== תוכנית תוכן שבועית ===");
    days
      .slice()
      .sort((a, b) => a.dayIndex - b.dayIndex)
      .forEach((day) => {
        lines.push(
          `יום ${DAY_LABELS[day.dayIndex]}: ${day.idea} [${CONTENT_TYPE_LABELS[day.contentType]} | ${GOAL_LABELS[day.goal]}]`
        );
      });
  }
  return lines.join("\n");
}

export function ProjectActions({
  project,
  content,
  days,
}: {
  project: ProjectLike;
  content: GeneratedContentResult;
  days: PlanDayLike[];
}) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  async function handleCopy() {
    const text = buildTextExport(project, content, days);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleExportPdf() {
    if (!printableRef.current) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(printableRef.current, {
        scale: 1.5,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      const imgData = canvas.toDataURL("image/jpeg", 0.85);

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`trendspark-${project.businessType}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
        >
          {copied ? (
            <Check className="size-4 text-emerald-400" />
          ) : (
            <Copy className="size-4" />
          )}
          {copied ? "הועתק!" : "העתקה"}
        </button>
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="flex items-center gap-2 rounded-full gradient-brand px-4 py-2 text-sm font-bold text-white shadow-md shadow-pink-500/20 disabled:opacity-60"
        >
          {exporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          הורדת PDF
        </button>
      </div>

      {/* Off-screen printable version, rendered for html2canvas so Hebrew/RTL renders correctly */}
      <div className="fixed left-[-9999px] top-0 -z-10">
        <div
          ref={printableRef}
          dir="rtl"
          style={{
            width: 780,
            padding: 40,
            background: "#ffffff",
            color: "#111111",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            TrendSpark AI - {project.businessType}
          </h1>
          <p style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>
            קהל יעד: {project.targetAudience} · סגנון: {TONE_LABELS[project.tone]} · פלטפורמה: {PLATFORM_LABELS[project.platform]}
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 20 }}>
            רעיונות לסרטונים ויראליים
          </h2>
          {content.ideas.map((idea, i) => (
            <div key={i} style={{ marginTop: 10, paddingBottom: 10, borderBottom: "1px solid #eee" }}>
              <p style={{ fontWeight: 700, fontSize: 14 }}>
                {i + 1}. {idea.title} — ציון ויראליות: {idea.viralityScore}/100
              </p>
              <p style={{ fontSize: 12, marginTop: 2 }}>{idea.concept}</p>
              <p style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{idea.viralityReason}</p>
            </div>
          ))}

          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 24 }}>תסריטים מלאים</h2>
          {content.scripts.map((script, i) => (
            <div key={i} style={{ marginTop: 14, paddingBottom: 14, borderBottom: "1px solid #eee" }}>
              <p style={{ fontWeight: 700, fontSize: 15 }}>
                תסריט {i + 1}: {script.title} ({script.durationSeconds} שנ׳, ציון: {script.viralityScore}/100)
              </p>
              <p style={{ fontSize: 12, marginTop: 4 }}>
                <b>Hook: </b>
                {script.hook}
              </p>
              <p style={{ fontSize: 12, marginTop: 4, whiteSpace: "pre-line" }}>
                <b>תסריט: </b>
                {script.scriptBody}
              </p>
              <p style={{ fontSize: 12, marginTop: 4 }}>
                <b>פירוק צילום:</b>
              </p>
              <ol style={{ fontSize: 12, marginRight: 16 }}>
                {script.shotBreakdown.map((shot, si) => (
                  <li key={si}>{shot}</li>
                ))}
              </ol>
              <p style={{ fontSize: 12, marginTop: 4 }}>
                <b>כיתוב: </b>
                {script.caption}
              </p>
              <p style={{ fontSize: 12, marginTop: 4 }}>
                <b>האשטגים: </b>
                <span dir="ltr" style={{ unicodeBidi: "embed" }}>
                  {script.hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")}
                </span>
              </p>
              <p style={{ fontSize: 12, marginTop: 4 }}>
                <b>CTA: </b>
                {script.cta}
              </p>
            </div>
          ))}

          {days.length > 0 && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 24 }}>
                תוכנית תוכן שבועית
              </h2>
              {days
                .slice()
                .sort((a, b) => a.dayIndex - b.dayIndex)
                .map((day) => (
                  <p key={day.dayIndex} style={{ fontSize: 12, marginTop: 6 }}>
                    <b>יום {DAY_LABELS[day.dayIndex]}:</b> {day.idea} (
                    {CONTENT_TYPE_LABELS[day.contentType]} · {GOAL_LABELS[day.goal]})
                  </p>
                ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
