import Link from "next/link";
import { Logo } from "@/components/logo";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-20 text-center">
      <Logo />
      <p className="mt-10 text-7xl font-extrabold gradient-text">404</p>
      <h1 className="mt-4 text-xl font-bold">הדף לא נמצא</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        נראה שהקישור שהגעתם אליו לא קיים או הוסר.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition-transform hover:scale-105"
      >
        חזרה לעמוד הבית
        <ArrowLeft className="size-4" />
      </Link>
    </div>
  );
}
