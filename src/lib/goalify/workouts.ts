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
