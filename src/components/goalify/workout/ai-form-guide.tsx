"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Play } from "lucide-react";
import { PoseIcon, type PoseKey } from "@/components/goalify/ui/pose-icon";

/** `HTMLMediaElement.error.code` only ever comes back numeric — this is
 * purely to make the console message readable instead of just "code 4". */
const MEDIA_ERROR_NAMES: Record<number, string> = {
  1: "MEDIA_ERR_ABORTED (loading was aborted)",
  2: "MEDIA_ERR_NETWORK (a network error interrupted the fetch)",
  3: "MEDIA_ERR_DECODE (the file was fetched but couldn't be decoded — corrupt or wrong codec)",
  4: "MEDIA_ERR_SRC_NOT_SUPPORTED (browser refused the source — this is what a 403/404/private-bucket response, a wrong path, or a non-video Content-Type all look like from here)",
};

/**
 * The "3D coach" visual: a real looping clip from Supabase Storage (see
 * lib/goalify/video.ts) when one resolves and actually loads, wrapped in a
 * tracked-frame treatment (corner brackets, scanning sweep) so it still
 * reads as an active AI analysis view rather than a bare video. Falls back
 * to the animated pose-icon placeholder whenever there's no video URL
 * (env var unset) or the clip fails to load (missing file, private
 * bucket, offline) — never a broken video icon or dead space.
 */
export function AIFormGuide({
  pose,
  label,
  hint,
  videoSrc,
  className,
}: {
  pose: PoseKey;
  label: string;
  hint: string;
  /** Public Supabase Storage URL for this phase's clip, or null/undefined
   * when one couldn't be resolved (see lib/goalify/video.ts). */
  videoSrc?: string | null;
  className?: string;
}) {
  // Tracks the *specific URL* that failed, not a plain resettable boolean —
  // an earlier version used a boolean plus a "give a new clip a fresh
  // chance" reset effect, but that reset ran on every mount (including the
  // first one) and could race the failure-detection effect below, silently
  // undoing a just-detected failure a moment after it was set. Keying off
  // the failed URL itself needs no reset at all: the moment `videoSrc`
  // changes to anything else, it can no longer equal `failedSrc`, so a new
  // clip always gets a fresh chance with zero timing games.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Logs exactly which URL is about to be requested, so the Network tab
  // claim ("is it even asking for the right thing?") can be checked
  // directly against this line instead of guessed at.
  useEffect(() => {
    if (videoSrc) {
      console.debug(`[AIFormGuide] requesting clip: ${videoSrc}`);
    } else {
      console.debug(
        "[AIFormGuide] no video URL resolved for this phase — showing the " +
          "placeholder. Most likely NEXT_PUBLIC_SUPABASE_URL isn't set in " +
          "this build (see console warnings from lib/goalify/video.ts on " +
          "page load).",
      );
    }
  }, [videoSrc]);

  // React's synthetic `onError`/`onLoadedData` props on <video> can race the
  // browser's own event dispatch: for a same-origin request that fails
  // near-instantly (e.g. a 404), the native `error` event can fire before
  // React finishes attaching its listener in the commit phase, and the
  // synthetic handler then never runs at all — confirmed by testing, where
  // the DOM's own `videoElement.error` ends up populated (MEDIA_ERR_SRC_NOT_SUPPORTED)
  // even though no onError callback fired. Attaching real listeners here
  // catches it regardless of that timing, and the explicit check right
  // after attaching catches the case where the error already happened
  // before this effect even ran.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoSrc) return;
    const src = videoSrc;

    function reportError(source: "event" | "already-set") {
      const mediaError = el?.error ?? null;
      const detail = mediaError
        ? (MEDIA_ERROR_NAMES[mediaError.code] ?? `unknown code ${mediaError.code}`)
        : "no MediaError details available";
      console.warn(
        `[AIFormGuide] clip failed to load (${source}), falling back to ` +
          `the placeholder.\n  URL: ${src}\n  Reason: ${detail}\n` +
          `  Open DevTools → Network, filter by "mp4", and check this ` +
          `exact URL's status code — 400/403 usually means the bucket or ` +
          `file isn't actually public yet, 404 means the path/filename ` +
          `doesn't match what's uploaded.`,
      );
      setFailedSrc(src);
    }

    function handleError() {
      reportError("event");
    }
    function handleLoadedData() {
      console.debug(`[AIFormGuide] clip loaded and playing: ${videoSrc}`);
    }

    el.addEventListener("error", handleError);
    el.addEventListener("loadeddata", handleLoadedData);

    // Covers the race described above — if the failure already landed on
    // the element before this effect ran, catch it here instead of never.
    if (el.error) reportError("already-set");

    return () => {
      el.removeEventListener("error", handleError);
      el.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [videoSrc]);

  const showVideo = Boolean(videoSrc) && videoSrc !== failedSrc;

  return (
    <div
      className={clsx(
        "gf-slot relative flex flex-col items-center justify-center gap-3 overflow-hidden",
        className,
      )}
    >
      {showVideo && (
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
      )}

      {/* Cinematic vignette — reads as a video-player bezel around the demo. */}
      <div
        className="pointer-events-none absolute inset-0 [.gf-cyber-scope_&]:bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden
      />

      {/* Tracking scan sweep — reinforces "AI analysis in progress". */}
      <div
        className="gf-anim-scan pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-transparent via-electric/12 to-transparent"
        aria-hidden
      />

      {/* Muted play-button watermark — video-player framing, not a real control. */}
      <Play
        className="pointer-events-none absolute right-4 bottom-4 z-10 size-6 fill-current text-ink/10 [.gf-cyber-scope_&]:text-electric/20"
        aria-hidden
      />

      {/* Viewfinder corner brackets. */}
      {(["top-3 left-3", "top-3 right-3 rotate-90", "bottom-3 right-3 rotate-180", "bottom-3 left-3 -rotate-90"] as const).map(
        (position) => (
          <span
            key={position}
            className={clsx(
              "pointer-events-none absolute size-4 border-t-2 border-l-2 border-electric/50",
              position,
            )}
            aria-hidden
          />
        ),
      )}

      {!showVideo && (
        <PoseIcon
          pose={pose}
          className="gf-anim-float relative z-10 h-28 w-28 drop-shadow-[0_6px_10px_rgba(0,82,255,0.28)] sm:h-32 sm:w-32 [.gf-cyber-scope_&]:drop-shadow-[0_6px_14px_rgba(232,179,44,0.32)]"
        />
      )}

      <div className="relative z-10 text-center">
        <p className="text-[11px] font-bold tracking-[0.16em] text-electric uppercase">
          {label}
        </p>
        <p className="mt-0.5 max-w-[22ch] text-[11px] leading-snug text-mist">
          {hint}
        </p>
      </div>
    </div>
  );
}
