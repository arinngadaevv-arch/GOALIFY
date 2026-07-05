import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "הרשמה בחינם",
  description:
    "פתחו חשבון TrendSpark AI חינמי והתחילו לקבל מהלך אחד ברור לעסק שלכם, כל שבוע.",
  alternates: { canonical: "/sign-up" },
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-16">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface/60 p-6">
        <h1 className="mb-1 text-center text-xl font-bold">
          בואו נפסיק לנחש יחד
        </h1>
        <p className="mb-6 text-center text-sm text-muted">
          חשבון חינמי, בלי כרטיס אשראי - דקה אחת ואתם בפנים.
        </p>
        <Suspense>
          <AuthForm mode="sign-up" />
        </Suspense>
      </div>
    </div>
  );
}
