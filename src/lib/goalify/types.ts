export type Goal = "burn" | "build" | "tone" | "athletic";
export type Level = "beginner" | "returning" | "consistent" | "advanced";
export type JointStatus = "none" | "knees" | "back" | "shoulders";
export type Sex = "female" | "male" | "unspecified";
export type SessionLength = "15" | "25" | "40";

export type QuizAnswers = {
  goal: Goal;
  level: Level;
  joints: JointStatus[];
  daysPerWeek: number;
  sessionLength: SessionLength;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  blocker: string;
};

export type Profile = QuizAnswers & {
  name: string;
  completedAt: string;
};

/** Everything the app persists between sessions. */
export type GoalifyState = {
  profile: Profile | null;
  /** Quiz answers captured so far — partial until the quiz is finished. */
  draft: Partial<QuizAnswers>;
  purchased: boolean;
  /** ISO `yyyy-mm-dd` strings for every day a workout was completed. */
  completedDays: string[];
  /** Index of the next workout in the program the user has not finished. */
  programDay: number;
  waterGlasses: number;
  waterUpdatedOn: string;
  settings: Settings;
  photos: ProgressPhoto[];
};

export type Settings = {
  kneeSafe: boolean;
  voiceCues: boolean;
  soundEffects: boolean;
  pushMotivation: boolean;
  pushWater: boolean;
  pushWorkout: boolean;
  units: "metric" | "imperial";
};

export type ProgressPhoto = {
  id: string;
  label: string;
  takenOn: string;
};

export type ExerciseKind = "time" | "reps";

export type Exercise = {
  id: string;
  name: string;
  kind: ExerciseKind;
  /** Seconds when `kind` is "time", repetitions when `kind` is "reps". */
  amount: number;
  restSeconds: number;
  cue: string;
  /** Muscles or focus shown in the player subtitle strip. */
  focus: string;
  /** Set when this movement loads the knees; swapped out in knee-safe mode. */
  kneeLoading?: boolean;
  kneeSafeAlternative?: {
    name: string;
    cue: string;
  };
};

export type Workout = {
  id: string;
  day: number;
  title: string;
  subtitle: string;
  focus: string;
  durationMinutes: number;
  calories: number;
  intensity: "Ignite" | "Build" | "Peak" | "Restore";
  exercises: Exercise[];
};

export type NutritionTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  waterMl: number;
  waterGlasses: number;
  maintenance: number;
  deficitOrSurplus: number;
};
