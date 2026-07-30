import clsx from "clsx";

/**
 * Fixed particle positions — deliberately not random, so the server and
 * client render identical markup and hydration stays clean.
 */
const PARTICLES = [
  { left: "8%", top: "22%", size: 6, delay: "0s", duration: "7s", lime: false },
  { left: "88%", top: "16%", size: 4, delay: "1.4s", duration: "9s", lime: true },
  { left: "72%", top: "68%", size: 7, delay: "0.6s", duration: "8s", lime: false },
  { left: "18%", top: "74%", size: 5, delay: "2.1s", duration: "10s", lime: true },
  { left: "48%", top: "12%", size: 4, delay: "1.1s", duration: "7.5s", lime: false },
  { left: "34%", top: "48%", size: 3, delay: "2.8s", duration: "9.5s", lime: true },
  { left: "62%", top: "34%", size: 5, delay: "0.3s", duration: "8.5s", lime: false },
  { left: "94%", top: "52%", size: 3, delay: "1.9s", duration: "11s", lime: true },
];

/** Drifting glow motes. Purely decorative energy for hero and hype moments. */
export function ParticleField({ className }: { className?: string }) {
  return (
    <div
      className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {PARTICLES.map((particle) => (
        <span
          key={`${particle.left}-${particle.top}`}
          className="gf-anim-mote absolute rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            background: particle.lime ? "#39FF14" : "#0052FF",
            boxShadow: `0 0 ${particle.size * 2}px ${particle.lime ? "#39FF14" : "#0052FF"}`,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
    </div>
  );
}
