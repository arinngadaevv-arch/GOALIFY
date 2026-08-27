/**
 * Real workout clips live in a public Supabase Storage bucket named
 * "videos". A public bucket's objects are reachable over a plain HTTPS GET
 * at a predictable URL shape — no supabase-js client, auth, or API key
 * needed, just `{projectUrl}/storage/v1/object/public/{bucket}/{path}`.
 * `NEXT_PUBLIC_SUPABASE_URL` is a public (browser-exposed) env var by
 * Next.js convention, which fits: a project's base URL isn't a secret.
 *
 * The clips actually uploaded are named after the exercise/moment itself,
 * not a numeric position, and several include spaces, hyphens or an "&" —
 * exactly the filenames as they exist in the bucket today:
 *   start.mp4, Water outage.mp4,
 *   Plank.mp4, Jump & Jacks.mp4, Sit-ups.mp4, Squats.mp4, Push-ups.mp4,
 *   Arm circle warm-up.mp4, Shoulder rotation warm-up.mp4,
 *   Running in place.mp4
 * `videoUrl()` below runs every one of these through `encodeURIComponent`
 * before it ever reaches a `<video src>`, so " " becomes `%20` and "&"
 * becomes `%26` — the browser would otherwise treat the raw space as the
 * end of the URL and 404 fetching only the text before it.
 */
const RAW_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_URL = RAW_SUPABASE_URL?.replace(/\/+$/, "");
const VIDEOS_BUCKET = "videos";

/**
 * The same three checks the console warning below runs, exposed so the
 * admin video-diagnostics panel (see checkout-diagnostics' sibling) can
 * show the identical verdict in the UI instead of only in DevTools —
 * `NEXT_PUBLIC_SUPABASE_URL` is a browser-exposed var by Next.js
 * convention, so there's nothing secret being surfaced here.
 */
export function diagnoseSupabaseUrl(): string | null {
  if (!RAW_SUPABASE_URL) {
    return "NEXT_PUBLIC_SUPABASE_URL is not set — every clip falls back to the placeholder.";
  }
  if (/supabase\.com\/dashboard/.test(RAW_SUPABASE_URL)) {
    return "This looks like a Supabase dashboard URL, not the project's API base URL (Settings > API > Project URL).";
  }
  if (!/^https?:\/\//.test(RAW_SUPABASE_URL)) {
    return 'Doesn\'t start with "http://" or "https://" — every video URL built from it will be broken.';
  }
  return null;
}

// Client-side only, and only ever once per page load — this is a
// configuration problem, not a per-render concern, and the user asked
// specifically to be able to see what's wrong from DevTools' Console tab.
if (typeof window !== "undefined") {
  const problem = diagnoseSupabaseUrl();
  if (problem) {
    console.warn(
      `[goalify/video] ${problem} Set it to your project's base URL ` +
        "(e.g. https://<project-ref>.supabase.co), then REDEPLOY: " +
        "NEXT_PUBLIC_ vars are baked into the JS bundle at build time, so " +
        "changing the value in Vercel's env var settings alone does " +
        "nothing until the next build.",
    );
  }
}

/** `fileName` is the literal object name in the bucket (spaces, "&", etc.
 * included) — `encodeURIComponent` percent-encodes it for the URL without
 * touching the already-safe path separators around it. */
function videoUrl(fileName: string): string | null {
  if (!SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${VIDEOS_BUCKET}/${encodeURIComponent(fileName)}`;
}

/** Plays once before the very first exercise's watch phase. */
export function introVideoUrl(): string | null {
  return videoUrl("start.mp4");
}

/** Plays during rest/recovery breaks between sets. */
export function restVideoUrl(): string | null {
  return videoUrl("Water outage.mp4");
}

/**
 * There's no per-position clip for every exercise in the library (see
 * lib/goalify/workouts.ts) — only a handful of named clips exist in the
 * bucket. Each exercise's `name` (falling back to its `focus` tag, same
 * order of preference as `poseForExercise` in ui/pose-icon.tsx) is matched
 * against the clips that actually exist; anything that doesn't match
 * returns null so AIFormGuide falls back to the pose-icon placeholder
 * instead of requesting a clip that was never uploaded.
 */
const EXERCISE_CLIPS: readonly [RegExp, string][] = [
  [/plank/i, "Plank.mp4"],
  [/jumping jack/i, "Jump & Jacks.mp4"],
  [/push[\s-]?up/i, "Push-ups.mp4"],
  [/(squat|wall sit)/i, "Squats.mp4"],
  [/(sit[\s-]?up|crunch|hollow body|dead bug)/i, "Sit-ups.mp4"],
  [/shoulder/i, "Shoulder rotation warm-up.mp4"],
  [/arm/i, "Arm circle warm-up.mp4"],
  [/(running in place|march in place|high knee|mountain climber|burpee)/i, "Running in place.mp4"],
];

export function exerciseVideoUrl(name: string, focus: string): string | null {
  for (const [pattern, fileName] of EXERCISE_CLIPS) {
    if (pattern.test(name)) return videoUrl(fileName);
  }
  for (const [pattern, fileName] of EXERCISE_CLIPS) {
    if (pattern.test(focus)) return videoUrl(fileName);
  }
  return null;
}

/**
 * A one-off uploaded workout clip doesn't necessarily live in the standard
 * "videos" bucket above — see `Workout["video"]` in lib/goalify/types.ts,
 * which records the exact bucket each one was uploaded to. Both bucket and
 * file name are `encodeURIComponent`-ed since bucket names can contain
 * spaces too (e.g. an uploader creating "videos 2" instead of reusing
 * "videos").
 */
export function customVideoUrl(bucket: string, fileName: string): string | null {
  if (!SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeURIComponent(fileName)}`;
}

/**
 * Every clip this app ever requests, labeled, for the admin video
 * diagnostics panel — lets it check each real file's actual HTTP status
 * (200 vs 404 vs 403) instead of only knowing whether the base URL is
 * configured at all.
 */
export function allKnownClips(): { label: string; fileName: string; url: string | null }[] {
  return [
    { label: "Intro (first watch phase)", fileName: "start.mp4", url: videoUrl("start.mp4") },
    { label: "Rest / recovery", fileName: "Water outage.mp4", url: videoUrl("Water outage.mp4") },
    ...EXERCISE_CLIPS.map(([, fileName]) => ({
      label: fileName.replace(/\.mp4$/, ""),
      fileName,
      url: videoUrl(fileName),
    })),
  ];
}
