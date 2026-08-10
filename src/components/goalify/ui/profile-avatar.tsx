"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Camera, Pencil, SmilePlus, UserRound, X } from "lucide-react";
import type { UserAvatar } from "@/lib/goalify/types";

const SIZE_CLASSES = {
  sm: "size-11",
  lg: "size-24",
} as const;

/** One-tap fitness-flavored picks — muscle leads since that fits GOALIFY
 * better than fire as the default suggestion; the keyboard's own emoji
 * picker below still covers anything not in this row. */
const EMOJI_PRESETS = ["💪", "🔥", "⚡", "🏆", "😎"];

const ICON_SIZE_CLASSES = {
  sm: "size-5",
  lg: "size-9",
} as const;

const EMOJI_SIZE_CLASSES = {
  sm: "text-xl",
  lg: "text-4xl",
} as const;

/**
 * The one place a user's own avatar is actually rendered — photo, emoji, or
 * (nothing picked yet) a dashed-border placeholder. Used both read-only
 * (the small one in TopBar, linking to Settings) and as the live preview
 * inside `ProfileAvatarPicker` below, so every instance in the app shows
 * the exact same thing rather than each screen inventing its own fallback.
 */
export function AvatarDisplay({
  avatar,
  size = "sm",
  className,
}: {
  avatar: UserAvatar | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  if (avatar?.kind === "photo") {
    return (
      // A user-picked local file read as a data URL — see progress.tsx's
      // PhotoTile for the same pattern. next/image's optimizer is for
      // remote/static assets, not a one-off in-memory blob, so a plain
      // <img> is the correct tool here.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar.dataUrl}
        alt="Your profile photo"
        className={clsx("rounded-2xl object-cover", SIZE_CLASSES[size], className)}
      />
    );
  }

  if (avatar?.kind === "emoji") {
    return (
      <span
        className={clsx(
          "gf-glass grid place-items-center rounded-2xl",
          SIZE_CLASSES[size],
          className,
        )}
        role="img"
        aria-label="Your profile emoji"
      >
        <span className={EMOJI_SIZE_CLASSES[size]} aria-hidden>
          {avatar.value}
        </span>
      </span>
    );
  }

  return (
    <span
      className={clsx(
        "grid place-items-center rounded-2xl border-2 border-dashed border-electric/35 bg-electric/8 text-electric",
        SIZE_CLASSES[size],
        className,
      )}
    >
      <UserRound className={ICON_SIZE_CLASSES[size]} strokeWidth={2.2} />
    </span>
  );
}

/**
 * The tappable version — an `AvatarDisplay` with a small edit badge
 * overlaid, that opens a bottom sheet offering "Upload a photo" (native
 * gallery/camera picker via a hidden file input, read as a data URL —
 * device-only storage, same as the Before/After vault photos in
 * progress.tsx, no backend needed) or "Choose an emoji" (a plain text
 * field — the OS's own emoji keyboard is the picker, not a custom in-app
 * grid). This is the one editable instance; every other place the avatar
 * shows up (TopBar) is read-only and links to Settings instead, since a
 * tiny 44px header icon isn't a sane place to host an upload flow on every
 * single screen.
 */
export function ProfileAvatarPicker({
  avatar,
  onChange,
  size = "lg",
  className,
}: {
  avatar: UserAvatar | null;
  onChange: (avatar: UserAvatar | null) => void;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [emojiMode, setEmojiMode] = useState(false);
  const [emojiDraft, setEmojiDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function closeSheet() {
    setOpen(false);
    setEmojiMode(false);
    setEmojiDraft("");
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange({ kind: "photo", dataUrl: reader.result });
        closeSheet();
      }
    };
    reader.readAsDataURL(file);
  }

  function saveEmoji() {
    const value = emojiDraft.trim();
    if (!value) return;
    onChange({ kind: "emoji", value });
    closeSheet();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Change your profile photo or emoji"
        className={clsx("gf-press relative shrink-0", className)}
      >
        <AvatarDisplay avatar={avatar} size={size} />
        <span className="gf-glow-electric absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full bg-electric text-white">
          <Pencil className="size-3.5" strokeWidth={2.6} />
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-hidden
              onClick={closeSheet}
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="avatar-sheet-heading"
              className="gf-anim-rise relative w-full max-w-md rounded-t-3xl border border-white/10 bg-[#12151d] p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.8)] sm:rounded-3xl sm:pb-6 sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
            >
              <button
                type="button"
                aria-label="Close"
                onClick={closeSheet}
                className="gf-press absolute top-4 right-4 grid size-8 place-items-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4.5" strokeWidth={2.5} />
              </button>

              <h2 id="avatar-sheet-heading" className="gf-display text-lg font-extrabold text-white">
                Profile photo
              </h2>

              {!emojiMode ? (
                <div className="mt-5 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="gf-press flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-white hover:bg-white/8"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-electric/15 text-electric">
                      <Camera className="size-5" strokeWidth={2.2} />
                    </span>
                    <span className="text-sm font-bold">Upload a photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmojiMode(true)}
                    className="gf-press flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-white hover:bg-white/8"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-electric/15 text-electric">
                      <SmilePlus className="size-5" strokeWidth={2.2} />
                    </span>
                    <span className="text-sm font-bold">Choose an emoji</span>
                  </button>

                  {avatar && (
                    <button
                      type="button"
                      onClick={() => {
                        onChange(null);
                        closeSheet();
                      }}
                      className="gf-press mt-1 rounded-2xl p-3 text-center text-xs font-bold text-white/50 hover:text-white/80"
                    >
                      Remove current photo
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-5 flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-bold text-white/70">Quick picks</p>
                    <div className="mt-2 grid grid-cols-5 gap-2">
                      {EMOJI_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            onChange({ kind: "emoji", value: preset });
                            closeSheet();
                          }}
                          aria-label={`Use ${preset} as your profile emoji`}
                          className="gf-press flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl hover:bg-white/10"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-white/60">
                    Or tap the field below and use your keyboard&apos;s emoji
                    picker (the smiley/globe key) to choose any other one.
                  </p>
                  <input
                    type="text"
                    inputMode="text"
                    autoFocus
                    maxLength={8}
                    value={emojiDraft}
                    onChange={(event) => setEmojiDraft(event.target.value)}
                    placeholder="😀"
                    className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-3xl text-white outline-none focus:border-electric/60"
                  />
                  <button
                    type="button"
                    onClick={saveEmoji}
                    disabled={!emojiDraft.trim()}
                    className="gf-press rounded-2xl bg-electric px-4 py-3 text-sm font-extrabold text-white disabled:opacity-40"
                  >
                    Use this emoji
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
