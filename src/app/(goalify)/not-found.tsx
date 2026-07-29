import { Brand } from "@/components/goalify/brand";
import { GlowLink } from "@/components/goalify/ui/glow-button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 text-center">
      <Brand />
      <p className="gf-numeric gf-text-hype mt-10 text-7xl font-black">404</p>
      <h1 className="gf-display mt-3 text-2xl font-extrabold text-ink">
        This page skipped leg day
      </h1>
      <p className="mt-2 max-w-sm text-sm text-mist">
        The link you followed doesn&apos;t exist any more.
      </p>
      <GlowLink href="/home" size="lg" className="mt-8">
        Back to my dashboard
      </GlowLink>
    </main>
  );
}
