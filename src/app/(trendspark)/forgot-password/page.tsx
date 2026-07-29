import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
  title: "שחזור סיסמה",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-16">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface/60 p-6">
        <h1 className="mb-6 text-center text-xl font-bold">שחזור סיסמה</h1>
        <Suspense>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
