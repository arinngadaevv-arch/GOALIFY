import { Loader } from "lucide-react";

/** Suspense fallback for routes that read search params on the client. */
export function RouteLoading() {
  return (
    <main className="grid min-h-dvh w-full place-items-center px-5">
      <Loader className="gf-anim-spin-slow size-8 text-electric" />
    </main>
  );
}
