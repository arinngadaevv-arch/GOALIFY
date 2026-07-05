const NICHE_LABELS: Record<string, string> = {
  cosmetology: "קוסמטיקה ואסתטיקה",
};

/** Human Hebrew label for a business niche, falling back to the raw value. */
export function nicheLabel(niche: string): string {
  return NICHE_LABELS[niche] ?? niche;
}
