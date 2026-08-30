import type { Exercise, Workout } from "./types";

/**
 * The starter program. Every knee-loading movement carries a paired
 * alternative so the "Knee-Safe Workouts" setting can swap it in place
 * without changing the shape or duration of the session.
 */
export const PROGRAM: Workout[] = [
  {
    id: "day-1",
    day: 1,
    title: "Full Body Ignition",
    subtitle: "Your day one. Wake every major muscle group up.",
    focus: "Full body · Conditioning",
    durationMinutes: 24,
    calories: 310,
    intensity: "Ignite",
    exercises: [
      {
        id: "d1-e1",
        name: "Dynamic Warm-Up Flow",
        kind: "time",
        amount: 60,
        restSeconds: 10,
        cue: "Roll the shoulders back, breathe through the nose.",
        focus: "Mobility",
      },
      {
        id: "d1-e2",
        name: "Bodyweight Squat",
        kind: "reps",
        amount: 14,
        restSeconds: 20,
        cue: "Chest tall, knees tracking over the toes.",
        focus: "Quads · Glutes",
        kneeLoading: true,
        kneeSafeAlternative: {
          name: "Glute Bridge",
          cue: "Drive through the heels, squeeze at the top.",
        },
      },
      {
        id: "d1-e3",
        name: "Incline Push-Up",
        kind: "reps",
        amount: 12,
        restSeconds: 20,
        cue: "Elbows at 45 degrees, ribs locked down.",
        focus: "Chest · Triceps",
      },
      {
        id: "d1-e4",
        name: "Plank Hold",
        kind: "time",
        amount: 40,
        restSeconds: 20,
        cue: "Squeeze the glutes — no sagging hips.",
        focus: "Core",
      },
      {
        id: "d1-e5",
        name: "Reverse Lunge",
        kind: "reps",
        amount: 10,
        restSeconds: 25,
        cue: "Step back long, keep the front shin vertical.",
        focus: "Legs · Balance",
        kneeLoading: true,
        kneeSafeAlternative: {
          name: "Standing Hip Hinge",
          cue: "Push the hips back, flat spine throughout.",
        },
      },
      {
        id: "d1-e6",
        name: "Mountain Climbers",
        kind: "time",
        amount: 30,
        restSeconds: 20,
        cue: "Fast feet, quiet landings, hips low.",
        focus: "Core · Cardio",
        kneeLoading: true,
        kneeSafeAlternative: {
          name: "Standing Knee Drive",
          cue: "Tall posture, controlled tempo, brace the core.",
        },
      },
      {
        id: "d1-e7",
        name: "Cool Down Stretch",
        kind: "time",
        amount: 60,
        restSeconds: 0,
        cue: "Long exhales. Let the heart rate fall.",
        focus: "Recovery",
      },
    ],
  },
  {
    id: "day-2",
    day: 2,
    title: "Upper Body Sculpt",
    subtitle: "Push, pull, and hold. Definition through the whole upper half.",
    focus: "Chest · Back · Arms",
    durationMinutes: 26,
    calories: 285,
    intensity: "Build",
    exercises: [
      {
        id: "d2-e1",
        name: "Shoulder Circles",
        kind: "time",
        amount: 45,
        restSeconds: 10,
        cue: "Slow and wide. Open the chest.",
        focus: "Mobility",
      },
      {
        id: "d2-e2",
        name: "Push-Up",
        kind: "reps",
        amount: 12,
        restSeconds: 25,
        cue: "One straight line from heel to head.",
        focus: "Chest · Triceps",
      },
      {
        id: "d2-e3",
        name: "Superman Hold",
        kind: "time",
        amount: 35,
        restSeconds: 20,
        cue: "Lift from the upper back, not the neck.",
        focus: "Posterior chain",
      },
      {
        id: "d2-e4",
        name: "Tricep Dip",
        kind: "reps",
        amount: 12,
        restSeconds: 25,
        cue: "Elbows straight back, shoulders away from ears.",
        focus: "Triceps",
      },
      {
        id: "d2-e5",
        name: "Side Plank",
        kind: "time",
        amount: 30,
        restSeconds: 20,
        cue: "Stack the shoulders, lift the bottom hip.",
        focus: "Obliques",
      },
      {
        id: "d2-e6",
        name: "Cool Down Stretch",
        kind: "time",
        amount: 60,
        restSeconds: 0,
        cue: "Breathe into the stretch, never bounce.",
        focus: "Recovery",
      },
    ],
  },
  {
    id: "day-3",
    day: 3,
    title: "Core & Conditioning Peak",
    subtitle: "The session that turns effort into visible definition.",
    focus: "Core · Cardio",
    durationMinutes: 22,
    calories: 340,
    intensity: "Peak",
    exercises: [
      {
        id: "d3-e1",
        name: "March In Place",
        kind: "time",
        amount: 45,
        restSeconds: 10,
        cue: "Drive the arms. Get the blood moving.",
        focus: "Warm-up",
      },
      {
        id: "d3-e2",
        name: "Dead Bug",
        kind: "reps",
        amount: 12,
        restSeconds: 20,
        cue: "Lower back glued to the floor the whole time.",
        focus: "Deep core",
      },
      {
        id: "d3-e3",
        name: "Squat Jump",
        kind: "reps",
        amount: 10,
        restSeconds: 30,
        cue: "Land soft, absorb through the hips.",
        focus: "Power",
        kneeLoading: true,
        kneeSafeAlternative: {
          name: "Fast Hip Hinge Pulse",
          cue: "Explosive but grounded — heels stay down.",
        },
      },
      {
        id: "d3-e4",
        name: "Hollow Body Hold",
        kind: "time",
        amount: 30,
        restSeconds: 25,
        cue: "Press the ribs down, reach long.",
        focus: "Core",
      },
      {
        id: "d3-e5",
        name: "High Knees",
        kind: "time",
        amount: 35,
        restSeconds: 25,
        cue: "Light on the toes, tall through the spine.",
        focus: "Cardio",
        kneeLoading: true,
        kneeSafeAlternative: {
          name: "Speed Arm Drives",
          cue: "Feet planted, punch the elbows back hard.",
        },
      },
      {
        id: "d3-e6",
        name: "Cool Down Stretch",
        kind: "time",
        amount: 60,
        restSeconds: 0,
        cue: "You showed up. Finish it properly.",
        focus: "Recovery",
      },
    ],
  },
];

/**
 * On-demand tracks — browsable from the Workout Library, not part of the
 * auto-rotating daily program. Same shape as `PROGRAM`, launched by id.
 */
export const LIBRARY: Workout[] = [
  {
    id: "full-body-burn",
    day: 4,
    title: "Full Body Burn",
    subtitle: "A relentless full-body circuit built to spike your heart rate.",
    focus: "Full body · High intensity",
    durationMinutes: 20,
    calories: 360,
    intensity: "Peak",
    exercises: [
      {
        id: "fbb-e1",
        name: "Jumping Jacks",
        kind: "time",
        amount: 40,
        restSeconds: 10,
        cue: "Full extension at the top, land soft.",
        focus: "Cardio",
        kneeLoading: true,
        kneeSafeAlternative: {
          name: "Standing Arm & Leg Reach",
          cue: "Reach wide without the jump — same rhythm.",
        },
      },
      {
        id: "fbb-e2",
        name: "Bodyweight Squat",
        kind: "reps",
        amount: 16,
        restSeconds: 20,
        cue: "Chest tall, knees tracking over the toes.",
        focus: "Quads · Glutes",
        kneeLoading: true,
        kneeSafeAlternative: {
          name: "Glute Bridge",
          cue: "Drive through the heels, squeeze at the top.",
        },
      },
      {
        id: "fbb-e3",
        name: "Push-Up",
        kind: "reps",
        amount: 12,
        restSeconds: 20,
        cue: "One straight line from heel to head.",
        focus: "Chest · Triceps",
      },
      {
        id: "fbb-e4",
        name: "Mountain Climbers",
        kind: "time",
        amount: 35,
        restSeconds: 20,
        cue: "Fast feet, quiet landings, hips low.",
        focus: "Core · Cardio",
        kneeLoading: true,
        kneeSafeAlternative: {
          name: "Standing Knee Drive",
          cue: "Tall posture, controlled tempo, brace the core.",
        },
      },
      {
        id: "fbb-e5",
        name: "Reverse Lunge",
        kind: "reps",
        amount: 10,
        restSeconds: 25,
        cue: "Step back long, keep the front shin vertical.",
        focus: "Legs · Balance",
        kneeLoading: true,
        kneeSafeAlternative: {
          name: "Standing Hip Hinge",
          cue: "Push the hips back, flat spine throughout.",
        },
      },
      {
        id: "fbb-e6",
        name: "Burpee",
        kind: "reps",
        amount: 8,
        restSeconds: 30,
        cue: "Control the drop, explode on the way up.",
        focus: "Full body · Power",
        kneeLoading: true,
        kneeSafeAlternative: {
          name: "Squat-to-Reach",
          cue: "Same rhythm, no jump — reach tall at the top.",
        },
      },
      {
        id: "fbb-e7",
        name: "Cool Down Stretch",
        kind: "time",
        amount: 60,
        restSeconds: 0,
        cue: "Long exhales. Let the heart rate fall.",
        focus: "Recovery",
      },
    ],
  },
  {
    id: "core-crusher",
    day: 5,
    title: "Core Crusher",
    subtitle: "Every angle of the midline — front, sides, and deep stabilizers.",
    focus: "Core · Stability",
    durationMinutes: 18,
    calories: 240,
    intensity: "Build",
    exercises: [
      {
        id: "cc-e1",
        name: "Dead Bug",
        kind: "reps",
        amount: 12,
        restSeconds: 15,
        cue: "Lower back glued to the floor the whole time.",
        focus: "Deep core",
      },
      {
        id: "cc-e2",
        name: "Plank Hold",
        kind: "time",
        amount: 40,
        restSeconds: 20,
        cue: "Squeeze the glutes — no sagging hips.",
        focus: "Core",
      },
      {
        id: "cc-e3",
        name: "Bicycle Crunch",
        kind: "reps",
        amount: 20,
        restSeconds: 20,
        cue: "Slow and controlled beats fast and sloppy.",
        focus: "Obliques",
      },
      {
        id: "cc-e4",
        name: "Side Plank",
        kind: "time",
        amount: 25,
        restSeconds: 15,
        cue: "Stack the shoulders, lift the bottom hip.",
        focus: "Obliques",
      },
      {
        id: "cc-e5",
        name: "Russian Twist",
        kind: "reps",
        amount: 20,
        restSeconds: 20,
        cue: "Rotate from the ribs, not just the arms.",
        focus: "Rotational core",
      },
      {
        id: "cc-e6",
        name: "Hollow Body Hold",
        kind: "time",
        amount: 30,
        restSeconds: 25,
        cue: "Press the ribs down, reach long.",
        focus: "Core",
      },
      {
        id: "cc-e7",
        name: "Cool Down Stretch",
        kind: "time",
        amount: 45,
        restSeconds: 0,
        cue: "Breathe into the stretch, never bounce.",
        focus: "Recovery",
      },
    ],
  },
  {
    id: "lower-body-joint-safe",
    day: 6,
    title: "Lower Body & Joints Safe",
    subtitle: "Build real leg and glute strength without a single jump or deep bend.",
    focus: "Glutes · Legs · Joint-friendly",
    durationMinutes: 22,
    calories: 260,
    intensity: "Build",
    exercises: [
      {
        id: "lbjs-e1",
        name: "Standing Hip Hinge",
        kind: "reps",
        amount: 14,
        restSeconds: 15,
        cue: "Push the hips back, flat spine throughout.",
        focus: "Hamstrings · Glutes",
      },
      {
        id: "lbjs-e2",
        name: "Glute Bridge",
        kind: "reps",
        amount: 16,
        restSeconds: 15,
        cue: "Drive through the heels, squeeze at the top.",
        focus: "Glutes",
      },
      {
        id: "lbjs-e3",
        name: "Wall Sit",
        kind: "time",
        amount: 35,
        restSeconds: 25,
        cue: "Knees stacked over ankles, back flat on the wall.",
        focus: "Quads · Isometric",
      },
      {
        id: "lbjs-e4",
        name: "Clamshell",
        kind: "reps",
        amount: 14,
        restSeconds: 15,
        cue: "Hips stacked, rotate from the hip — not the back.",
        focus: "Hip stability",
      },
      {
        id: "lbjs-e5",
        name: "Fire Hydrant",
        kind: "reps",
        amount: 12,
        restSeconds: 15,
        cue: "Lift from the hip, keep the knee bent throughout.",
        focus: "Glutes · Hip stability",
      },
      {
        id: "lbjs-e6",
        name: "Calf Raise",
        kind: "reps",
        amount: 18,
        restSeconds: 15,
        cue: "Full stretch at the bottom, pause at the top.",
        focus: "Calves",
      },
      {
        id: "lbjs-e7",
        name: "Cool Down Stretch",
        kind: "time",
        amount: 60,
        restSeconds: 0,
        cue: "Long exhales. Let the heart rate fall.",
        focus: "Recovery",
      },
    ],
  },
  {
    id: "tar2",
    day: 7,
    title: "Quick Video Workout",
    subtitle: "A quick follow-along circuit — just press play and move with the video.",
    focus: "Full body · Follow-along",
    durationMinutes: 3,
    calories: 50,
    intensity: "Build",
    // Never actually played — VideoLedPlayer (see workout/video-led-player.tsx)
    // takes over instead of the exercise-by-exercise timer whenever `video`
    // below is set. These three placeholder rounds exist only so the
    // shared launchpad/library UI, which reads `.exercises.length` for its
    // "Moves" stat, still has something to count.
    exercises: [
      {
        id: "tar2-r1",
        name: "Round 1",
        kind: "time",
        amount: 60,
        restSeconds: 0,
        cue: "Follow along with the video.",
        focus: "Full body",
      },
      {
        id: "tar2-r2",
        name: "Round 2",
        kind: "time",
        amount: 60,
        restSeconds: 0,
        cue: "Follow along with the video.",
        focus: "Full body",
      },
      {
        id: "tar2-r3",
        name: "Round 3",
        kind: "time",
        amount: 60,
        restSeconds: 0,
        cue: "Follow along with the video.",
        focus: "Full body",
      },
    ],
    video: {
      bucket: "videos 2",
      fileName: "TAR2.mp4",
      introSeconds: 10,
      outroSeconds: 10,
      loops: 3,
    },
  },
];

/** Every workout the app knows about, keyed for fast lookup by id. */
const ALL_WORKOUTS = [...PROGRAM, ...LIBRARY];

export function findWorkout(id: string): Workout | undefined {
  return ALL_WORKOUTS.find((workout) => workout.id === id);
}

/** Applies the knee-safe swap to a workout without mutating the source data. */
export function resolveWorkout(workout: Workout, kneeSafe: boolean): Workout {
  if (!kneeSafe) return workout;
  return {
    ...workout,
    exercises: workout.exercises.map(applyKneeSafe),
  };
}

function applyKneeSafe(exercise: Exercise): Exercise {
  if (!exercise.kneeLoading || !exercise.kneeSafeAlternative) return exercise;
  return {
    ...exercise,
    name: exercise.kneeSafeAlternative.name,
    cue: exercise.kneeSafeAlternative.cue,
  };
}

export function workoutForDay(programDay: number): Workout {
  return PROGRAM[(programDay - 1) % PROGRAM.length];
}

/** Total session length including rest, in seconds. */
export function workoutSeconds(workout: Workout): number {
  return workout.exercises.reduce((total, exercise) => {
    const work = exercise.kind === "time" ? exercise.amount : exercise.amount * 3;
    return total + work + exercise.restSeconds;
  }, 0);
}
