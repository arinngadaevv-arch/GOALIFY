import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = {
  title: "איפוס סיסמה",
  alternates: { canonical: "/reset-password" },
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-16">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface/60 p-6">
        <h1 className="mb-6 text-center text-xl font-bold">בחירת סיסמה חדשה</h1>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
