import { Navbar } from "@/components/navbar";
import { PricingCards } from "@/components/pricing-cards";

export default function PricingPage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold">
            תוכניות <span className="gradient-text">מחיר</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            בחרו את התוכנית שמתאימה לקצב הפרסום שלכם. אפשר לשדרג או לבטל בכל
            רגע.
          </p>
        </div>
        <div className="mt-12">
          <PricingCards />
        </div>
      </main>
      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted sm:px-6">
        © {new Date().getFullYear()} TrendSpark AI. כל הזכויות שמורות.
      </footer>
    </div>
  );
}
