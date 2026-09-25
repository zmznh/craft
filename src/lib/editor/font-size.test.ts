import { describe, expect, it } from 'vitest';
import { DEFAULT_FONT_SIZE, isFontSize, stepFontSize } from './font-size';

describe('stepFontSize', () => {
  it('walks up and down the ladder', () => {
    expect(stepFontSize(16, 1)).toBe(18);
    expect(stepFontSize(16, -1)).toBe(14);
    expect(stepFontSize(14, 1)).toBe(16);
  });

  it('treats a missing size as the document default', () => {
    expect(stepFontSize(null, 1)).toBe(18);
    expect(stepFontSize(undefined, -1)).toBe(14);
  });

  it('clamps at both ends', () => {
    expect(stepFontSize(10, -1)).toBe(10);
    expect(stepFontSize(48, 1)).toBe(48);
  });

  it('snaps an off-ladder size to the nearest step', () => {
    expect(stepFontSize(17, 1)).toBe(18);
    expect(stepFontSize(17, -1)).toBe(16);
    expect(stepFontSize(5, -1)).toBe(10);
    expect(stepFontSize(100, 1)).toBe(48);
  });
});

describe('isFontSize', () => {
  it('accepts only ladder values', () => {
    expect(isFontSize(DEFAULT_FONT_SIZE)).toBe(true);
    expect(isFontSize(15)).toBe(false);
    expect(isFontSize('16')).toBe(false);
  });
});
