import { BusinessSetupForm } from "@/components/business-setup-form";

export default function NewBusinessPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-extrabold">בואו נכיר את העסק</h1>
      <p className="mt-1 text-sm text-muted">
        כמה פרטים בסיסיים, ואז נתחיל לעקוב אחרי מה שקורה אצלך השבוע.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-surface/60 p-6 sm:p-8">
        <BusinessSetupForm />
      </div>
    </div>
  );
}
