# Quiz answer photography

Local files only — no remote URLs. Drop a photo in this folder and it
appears automatically on the matching answer card. Until a file exists,
that card falls back to a small icon badge — never a broken image, never
an external request. The layout is identical either way, so you can add
photos one at a time.

## Naming

Most cards are named `<stepId>-<optionValue>.png`. The `goal` and
`painTrigger` steps are named exceptions. The exact list the quiz looks
for:

| File | Card |
| --- | --- |
| `lean.jpg` | Lean & shredded |
| `muscle.jpg` | Bigger & stronger |
| `toned.jpg` | Toned & defined |
| `athletic.jpg` | Athletic & unstoppable |
| `sex-female.png` | Female |
| `sex-male.png` | Male |
| `no-time.png` | No time |
| `motivation.jpg` | Fading motivation |
| `no-plan.png` | No clear plan |
| `injury.png` | Pain or injury |
| `false-starts.png` | Repeated false starts |
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
