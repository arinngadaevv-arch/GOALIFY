# Quiz answer photography

Local files only — no remote URLs. Drop a photo in this folder and it's
picked up automatically. **A step only ever shows photos if every option
in it has one** — one real photo next to icon placeholders reads as
broken, not premium, so an incomplete set falls back to a clean icon
treatment across the whole step instead. Add the missing files for a
step and it flips to full-bleed photo cards automatically, no code
changes needed.

## Naming

The exact list the quiz looks for, by step:

| File | Card |
| --- | --- |
| `goal-burn.png` | Lean & shredded |
| `goal-build.png` | Bigger & stronger |
| `goal-tone.png` | Toned & defined |
| `goal-athletic.png` | Athletic & unstoppable |
| `no-time.png` | No time |
| `motivation.jpg` | Fading motivation |
| `no-plan.png` | No clear plan |
| `injury.png` | Pain or injury |
| `false-starts.png` | Repeated false starts |
| `level-beginner.png` | Beginner |
| `level-returning.png` | Returning |
| `level-consistent.png` | Consistent |
| `level-advanced.png` | Advanced |

Every one of the above already exists and is wired in. `joints`,
`focusZones`, `weightKg` (vitals) and `commitment` are not photo-driven —
they're a commitment card, an interactive body map and a slider screen,
not option cards.

## Art direction

- **Full photos are fine** — no transparent cut-out required. Cards render
  full-bleed: the photo fills the entire card edge to edge
  (`object-fit: cover`) with a dark gradient scrim at the bottom holding
  white text, the pattern top fitness apps (BetterMe, Home Workout) use
  for goal-selection cards.
- **Keep the subject centred and mid-frame** — `object-position: center`,
  and leave breathing room at the bottom third of the frame since that's
  where the gradient + label sit.
- Roughly **4:5 portrait to landscape** works for every current slot.
- Export at **2× the display size** for retina — these render at up to
  ~340×280 in a card, so ~700×600 or larger source images hold up fine.
- The quiz itself is a bright, light theme with cyan/gold accents — even,
  naturally lit photography reads best; avoid heavy color casts.

## Changing which cards use photos

Layout is per question, set by the `layout` field in
`src/lib/goalify/quiz.ts`:

- `wide` — full-width rows; full-bleed photo background when the step's
  photos are complete (`goal`, `painTrigger`)
- `tile` — two-column grid; full-bleed photo background when complete
  (`level`)
- `portrait` — two columns, cut-out breaks above the card top (defined,
  not currently used by any step)
- `list` — compact two-column icon tiles, no photo (used as the fallback
  everywhere a step's photo set is incomplete)
