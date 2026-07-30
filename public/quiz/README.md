# Quiz answer photography

Drop cut-out photos in this folder and they appear automatically on the
matching answer card. Until a file exists, that card falls back to an
illustrated figure — the layout is identical either way, so you can add the
photos one at a time.

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
- `wide` — full-width row, photo bleeds off the right edge (`goal`, `level`)
- `tile` — two columns, photo above the label (`painTrigger`, `vision`,
  `commitment`)
- `list` — compact icon row, no photo (`joints`, `sessionLength`,
  `daysPerWeek`)
