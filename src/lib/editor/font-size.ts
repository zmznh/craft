/** The sizes Craft steps through; 16px is the document default. */
export const FONT_SIZE_STEPS = [10, 12, 14, 16, 18, 22, 28, 36, 48] as const;

export const DEFAULT_FONT_SIZE = 16;

export type FontSize = (typeof FONT_SIZE_STEPS)[number];

/**
 * Moves a block's size one step up or down and clamps at both ends. An unknown
 * current size (a document edited elsewhere) snaps to the nearest step rather than
 * falling off the ladder.
 */
export function stepFontSize(current: number | null | undefined, delta: 1 | -1): number {
  const size = current ?? DEFAULT_FONT_SIZE;

  const exact = FONT_SIZE_STEPS.indexOf(size as FontSize);
  if (exact >= 0) {
    return FONT_SIZE_STEPS[Math.min(FONT_SIZE_STEPS.length - 1, Math.max(0, exact + delta))];
  }

  const below = [...FONT_SIZE_STEPS].reverse().find((step) => step < size);
  const above = FONT_SIZE_STEPS.find((step) => step > size);
  if (delta > 0) return above ?? FONT_SIZE_STEPS[FONT_SIZE_STEPS.length - 1];
  return below ?? FONT_SIZE_STEPS[0];
}

export function isFontSize(value: unknown): value is FontSize {
  return typeof value === 'number' && (FONT_SIZE_STEPS as readonly number[]).includes(value);
}
