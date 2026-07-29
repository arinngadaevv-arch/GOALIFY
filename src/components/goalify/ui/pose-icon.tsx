type Point = readonly [number, number];

type PoseSpec = {
  head: Point;
  /** Each pair is one limb/torso segment, drawn as a rounded stroke line. */
  bones: readonly (readonly [Point, Point])[];
};

const POSES = {
  plank: {
    head: [14, 54],
    bones: [
      // Forearm rests flat along the ground — the cue that reads as
      // "plank" rather than "push-up" at a glance.
      [
        [38, 88],
        [20, 88],
      ],
      [
        [20, 88],
        [22, 60],
      ],
      [
        [22, 60],
        [56, 64],
      ],
      [
        [56, 64],
        [90, 68],
      ],
      [
        [90, 68],
        [90, 88],
      ],
    ],
  },
  pushup: {
    head: [22, 60],
    bones: [
      [
        [30, 88],
        [27, 76],
      ],
      [
        [27, 76],
        [30, 65],
      ],
      [
        [30, 65],
        [60, 69],
      ],
      [
        [60, 69],
        [94, 73],
      ],
      [
        [94, 73],
        [94, 88],
      ],
    ],
  },
  squat: {
    head: [50, 20],
    bones: [
      [
        [50, 30],
        [46, 55],
      ],
      [
        [46, 55],
        [66, 62],
      ],
      [
        [66, 62],
        [64, 88],
      ],
      [
        [50, 30],
        [30, 45],
      ],
    ],
  },
  lunge: {
    head: [40, 18],
    bones: [
      [
        [40, 28],
        [42, 52],
      ],
      [
        [42, 52],
        [60, 58],
      ],
      [
        [60, 58],
        [58, 88],
      ],
      [
        [42, 52],
        [20, 70],
      ],
      [
        [20, 70],
        [10, 88],
      ],
      [
        [40, 28],
        [52, 42],
      ],
    ],
  },
  core: {
    head: [32, 38],
    bones: [
      [
        [50, 70],
        [38, 45],
      ],
      [
        [38, 45],
        [20, 50],
      ],
      [
        [50, 70],
        [68, 66],
      ],
      [
        [68, 66],
        [82, 72],
      ],
    ],
  },
  cardio: {
    head: [46, 18],
    bones: [
      [
        [46, 28],
        [48, 52],
      ],
      [
        [48, 52],
        [32, 48],
      ],
      [
        [32, 48],
        [30, 30],
      ],
      [
        [48, 52],
        [60, 66],
      ],
      [
        [60, 66],
        [64, 86],
      ],
      [
        [46, 28],
        [60, 30],
      ],
      [
        [60, 30],
        [66, 42],
      ],
      [
        [46, 28],
        [34, 34],
      ],
      [
        [34, 34],
        [24, 26],
      ],
    ],
  },
  mobility: {
    head: [50, 16],
    bones: [
      [
        [50, 26],
        [50, 54],
      ],
      [
        [50, 54],
        [46, 88],
      ],
      [
        [50, 54],
        [58, 88],
      ],
      [
        [50, 26],
        [38, 8],
      ],
      [
        [50, 26],
        [64, 8],
      ],
    ],
  },
  bridge: {
    head: [14, 76],
    bones: [
      [
        [20, 80],
        [10, 84],
      ],
      [
        [20, 80],
        [54, 58],
      ],
      [
        [54, 58],
        [78, 68],
      ],
      [
        [78, 68],
        [82, 86],
      ],
    ],
  },
  dip: {
    head: [30, 24],
    bones: [
      [
        [30, 34],
        [32, 58],
      ],
      [
        [30, 34],
        [46, 50],
      ],
      [
        [46, 50],
        [46, 68],
      ],
      [
        [32, 58],
        [52, 64],
      ],
      [
        [52, 64],
        [74, 60],
      ],
    ],
  },
  extension: {
    head: [18, 52],
    bones: [
      [
        [18, 52],
        [30, 60],
      ],
      [
        [30, 60],
        [62, 62],
      ],
      [
        [30, 60],
        [10, 48],
      ],
      [
        [62, 62],
        [88, 50],
      ],
    ],
  },
  base: {
    head: [50, 18],
    bones: [
      [
        [50, 28],
        [50, 56],
      ],
      [
        [50, 56],
        [38, 88],
      ],
      [
        [50, 56],
        [62, 88],
      ],
      [
        [50, 28],
        [34, 40],
      ],
      [
        [34, 40],
        [30, 54],
      ],
      [
        [50, 28],
        [66, 40],
      ],
      [
        [66, 40],
        [70, 54],
      ],
    ],
  },
  // Star pose: arms and legs spread wide overhead — the jumping-jack peak.
  jack: {
    head: [50, 16],
    bones: [
      [
        [50, 26],
        [50, 54],
      ],
      [
        [50, 54],
        [26, 88],
      ],
      [
        [50, 54],
        [74, 88],
      ],
      [
        [50, 26],
        [22, 10],
      ],
      [
        [50, 26],
        [78, 10],
      ],
    ],
  },
  // Seated rotation: knees bent, torso twisted, arms swept across — russian
  // twist / rotational-core movements.
  twist: {
    head: [30, 30],
    bones: [
      [
        [50, 74],
        [36, 42],
      ],
      [
        [36, 42],
        [64, 30],
      ],
      [
        [50, 74],
        [70, 66],
      ],
      [
        [70, 66],
        [86, 78],
      ],
      [
        [50, 74],
        [66, 82],
      ],
      [
        [66, 82],
        [82, 72],
      ],
    ],
  },
} as const satisfies Record<string, PoseSpec>;

export type PoseKey = keyof typeof POSES;

const NAME_PATTERNS: readonly [RegExp, PoseKey][] = [
  [/plank/i, "plank"],
  [/push[\s-]?up/i, "pushup"],
  [/dip/i, "dip"],
  [/(glute bridge|fire hydrant|clamshell|^bridge)/i, "bridge"],
  [/superman/i, "extension"],
  [/jumping jack/i, "jack"],
  [/twist/i, "twist"],
  [/wall sit/i, "squat"],
  [/(squat|jump)/i, "squat"],
  [/lunge/i, "lunge"],
  [/(leg raise|leg lift|bicycle crunch|dead bug|hollow|crunch|core)/i, "core"],
  [/(burpee|mountain climber|high knee|march|climber)/i, "cardio"],
  [/calf raise/i, "mobility"],
  [/(hip hinge|stretch|warm-up|circle|mobility|cool down)/i, "mobility"],
];

/** Maps an exercise's name (falling back to its focus tag) to a pose. */
export function poseForExercise(name: string, focus: string): PoseKey {
  for (const [pattern, pose] of NAME_PATTERNS) {
    if (pattern.test(name)) return pose;
  }
  for (const [pattern, pose] of NAME_PATTERNS) {
    if (pattern.test(focus)) return pose;
  }
  return "base";
}

/**
 * A stylised mocap-skeleton line figure — electric-blue limbs with glowing
 * lime joint markers — standing in for the rendered 3D coach demonstration.
 */
export function PoseIcon({
  pose,
  className,
}: {
  pose: PoseKey;
  className?: string;
}) {
  const spec = POSES[pose];
  const joints = new Map<string, Point>();
  for (const [a, b] of spec.bones) {
    joints.set(a.join(","), a);
    joints.set(b.join(","), b);
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`${pose} pose reference`}
    >
      <g
        fill="none"
        stroke="#0052FF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {spec.bones.map(([a, b], index) => (
          <line
            key={index}
            x1={a[0]}
            y1={a[1]}
            x2={b[0]}
            y2={b[1]}
          />
        ))}
      </g>
      <circle
        cx={spec.head[0]}
        cy={spec.head[1]}
        r={7.5}
        fill="rgba(255,255,255,0.9)"
        stroke="#0052FF"
        strokeWidth="6"
      />
      {Array.from(joints.values()).map(([x, y], index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r={3.5}
          fill="#39FF14"
          style={{ filter: "drop-shadow(0 0 3px #39FF14)" }}
        />
      ))}
    </svg>
  );
}
