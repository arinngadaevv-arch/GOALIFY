/**
 * Real workout clips live in a public Supabase Storage bucket named
 * "videos". A public bucket's objects are reachable over a plain HTTPS GET
 * at a predictable URL shape — no supabase-js client, auth, or API key
 * needed, just `{projectUrl}/storage/v1/object/public/{bucket}/{path}`.
 * `NEXT_PUBLIC_SUPABASE_URL` is a public (browser-exposed) env var by
 * Next.js convention, which fits: a project's base URL isn't a secret.
 *
 * Naming convention agreed for the uploaded clips (1-indexed to match each
 * exercise's position in a workout):
 *   intro.mp4, exercise-1.mp4, exercise-2.mp4, ..., water.mp4, outro.mp4
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
const VIDEOS_BUCKET = "videos";

function videoUrl(fileName: string): string | null {
  if (!SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${VIDEOS_BUCKET}/${fileName}`;
}

/** Plays once before the very first exercise's watch phase. */
export function introVideoUrl(): string | null {
  return videoUrl("intro.mp4");
}

/** `position` is 1-indexed — the exercise's place in the workout, matching
 * the uploaded `exercise-1.mp4`, `exercise-2.mp4`, ... naming. */
export function exerciseVideoUrl(position: number): string | null {
  return videoUrl(`exercise-${position}.mp4`);
}

/** Plays during rest/recovery breaks between sets. */
export function restVideoUrl(): string | null {
  return videoUrl("water.mp4");
}

/** Plays once on the workout-complete screen. */
export function outroVideoUrl(): string | null {
  return videoUrl("outro.mp4");
}
