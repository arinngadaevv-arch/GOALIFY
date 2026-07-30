/**
 * Fixed particle directions — deliberately not random so server and client
 * markup match exactly (no hydration mismatch) and the burst always reads
 * as a clean radial pop rather than a lopsided scatter.
 */
const PARTICLES = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const distance = 46 + (i % 3) * 10;
  return {
    tx: Math.round(Math.cos(angle) * distance),
    ty: Math.round(Math.sin(angle) * distance),
    delay: (i % 4) * 0.02,
    color: i % 2 === 0 ? "#22d3ee" : i % 3 === 0 ? "#ff7a1a" : "#a855f7",
  };
});

/**
 * A short-lived radial burst of neon dots, meant to be mounted (via a
 * changing `key` on the parent) the instant an option is selected and
 * removed once the animation finishes.
 */
export function SelectionBurst() {
  return (
    <span
      className="pointer-events-none absolute inset-0 z-30 overflow-visible"
      aria-hidden
    >
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="gf-particle"
          style={
            {
              "--tx": `${particle.tx}px`,
              "--ty": `${particle.ty}px`,
              background: particle.color,
              boxShadow: `0 0 6px ${particle.color}`,
              animationDelay: `${particle.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}
