"use client";

import { useRouter } from "next/navigation";
import { BusinessForm } from "@/components/business-form";

export default function NewProjectPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold">
          בואו ניצור <span className="gradient-text">תוכן ויראלי</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          ספרו לנו על העסק שלכם ותוך שניות תקבלו חבילת תוכן מלאה.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface/60 p-6 sm:p-8">
        <BusinessForm
          onSuccess={(data) => {
            router.push(`/dashboard/projects/${data.project.id}`);
          }}
        />
      </div>
    </div>
  );
}
