# Quiz answer photography

Two ways to get a real photo onto an answer card — use whichever is easier
for you. Until either is set, that card falls back to a large illustrated
glyph. The layout is identical no matter which path you use, so you can add
photos one at a time.

## Option A — local files (this folder)

Drop cut-out photos in this folder and they appear automatically on the
matching answer card.

## Option B — remote URL

Set the option's `image` field in `src/lib/goalify/quiz.ts` to a full
`https://` URL instead of a local path (e.g. licensed stock photography).
The host must be listed in `images.remotePatterns` in `next.config.ts` —
`images.unsplash.com` and `plus.unsplash.com` are already allowed; add
others there if you use a different source.

## Naming

Files are named `<stepId>-<optionValue>.png`. The exact list the quiz looks
for:

| File | Card |
| --- | --- |
| `sex-female.png` | Female |
| `sex-male.png` | Male |
| `goal-burn.png` | Lean and cut |
| `goal-build.png` | Bigger and stronger |
| `goal-tone.png` | Toned and defined |
| `goal-athletic.png` | Athletic and unstoppable |
| `painTrigger-time.png` | I never have the time |
| `painTrigger-motivation.png` | My motivation dies |
| `painTrigger-confusion.png` | I never know what to do |
| `painTrigger-injury.png` | Pain keeps stopping me |
| `painTrigger-restart.png` | I keep starting over |
| `vision-confident.png` | Completely confident |
| `vision-strong.png` | Genuinely strong |
| `vision-energised.png` | Full of energy |
| `vision-proud.png` | Proud I finally did it |
| `level-beginner.png` | Total beginner |
| `level-returning.png` | Coming back after a break |
| `level-consistent.png` | Training fairly consistently |
| `level-advanced.png` | Advanced |
| `commitment-allin.png` | I'm all in |
| `commitment-most.png` | Most days, honestly |
| `commitment-unsure.png` | Show me it works first |

## Art direction

- **Transparent PNG cut-outs**, no background. The card supplies its own soft
  blue tint behind the subject.
- **Subject anchored to the bottom** of the frame — images are rendered with
  `object-position: bottom`, so a figure standing on the bottom edge sits
  correctly whichever layout it lands in.
- **Roughly 2:3 portrait** for `sex-*` (these break above the card top and are
  the largest on screen), and roughly square for everything else.
- Export at **2× the display size** for retina: ~600×900 for `sex-*`, ~480×480
  for the rest.
- Keep the lighting bright and even to match the light UI.

## Changing which cards use photos

Layout is per question, set by the `layout` field in
`src/lib/goalify/quiz.ts`:

- `portrait` — two columns, cut-out breaks above the card (used for `sex`)
- `wide` — full-width horizontal banner, photo bleeds off the right edge
  (`goal`, `painTrigger`, `vision`, `level`, `commitment`)
- `tile` — two columns, photo above the label (not currently used, but
  supported)
- `list` — compact two-column tiles, no photo (`joints`, `sessionLength`,
  `daysPerWeek`)
