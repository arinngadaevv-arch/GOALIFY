export type Goal = "burn" | "build" | "tone" | "athletic";
export type Level = "beginner" | "returning" | "consistent" | "advanced";
export type JointStatus = "none" | "knees" | "back" | "shoulders";
export type Sex = "female" | "male" | "unspecified";
export type SessionLength = "15" | "25" | "40";

/** The feeling they're chasing, echoed back throughout the app. */
export type Vision = "confident" | "strong" | "energised" | "proud";

/** How long it's been since they last had the body they want — the more
 * recent, the more "muscle memory" framing the plan can lean on. */
export type LastIdealBody = "now" | "under1" | "oneToThree" | "over3" | "never";

/** How hard they committed — sets the accountability tone. */
export type Commitment = "allin" | "most" | "unsure";

/**
 * Self-estimated starting body composition, picked from a 6-card real-photo
 * grid — each value keyed to the reference photo's name, not the % band
 * itself, since the band text is editable copy but the photo identity isn't.
 */
export type BodyFatBand =
  | "daniel" // 25%+
  | "ethan" // 20-24%
  | "liam" // 15-18%
  | "noah" // 10-12%
  | "mason" // 8-10%
  | "jayden"; // 5-7%

export type QuizAnswers = {
  goal: Goal;
  lastIdealBody: LastIdealBody;
  /** Body zones tapped on the interactive target map — drives programming emphasis. */
  focusZones: string[];
  level: Level;
  joints: JointStatus[];
  bodyFatPercent: BodyFatBand;
  daysPerWeek: number;
  sessionLength: SessionLength;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  vision: Vision;
  commitment: Commitment;
};

export type Profile = QuizAnswers & {
  name: string;
  completedAt: string;
};

/** What renders in place of the generic person icon everywhere the user's
 * own avatar shows up (top bar, settings) — either a photo picked from the
 * device or a single emoji typed via the OS keyboard. Lives outside
 * `Profile` deliberately: `Profile` is fully replaced by `toProfile` every
 * time the quiz is retaken (see plan.ts), which would silently wipe an
 * avatar field stored there. */
export type UserAvatar =
  | { kind: "photo"; dataUrl: string }
  | { kind: "emoji"; value: string };

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
  /** Today's accelerometer-detected step count — see use-step-tracker.ts. */
  steps: number;
  stepsUpdatedOn: string;
  /** Set once the local quiz profile has been synced to the server (see
   * api/user/quiz/route.ts) — null until then, never reset. */
  quizSyncedAt: string | null;
  settings: Settings;
  photos: ProgressPhoto[];
  /** Data URLs for the two fixed Before/After vault slots (see progress.tsx)
   * — device-only, never uploaded, so a plain data URL in localStorage is
   * the whole storage layer. Null until the user actually picks a photo. */
  beforePhotoUrl: string | null;
  afterPhotoUrl: string | null;
  /** Null until the user picks a photo or emoji in Settings — falls back to
   * the generic person-icon placeholder everywhere it's rendered. */
  avatar: UserAvatar | null;
  /** True once the user has submitted a review (see api/reviews) or
   * explicitly dismissed the prompt — either way, ReviewPrompt on the
   * post-workout CompletionScreen never asks again. */
  reviewPromptDismissed: boolean;
};

export type Settings = {
  kneeSafe: boolean;
  soundEffects: boolean;
  /** Web Vibration API buzz on milestones — step goal, workout finish, streak day. */
  haptics: boolean;
  pushMotivation: boolean;
  pushNutrition: boolean;
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
