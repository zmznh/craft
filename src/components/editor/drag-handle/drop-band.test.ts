import { describe, expect, it } from 'vitest';
import { dropTargetFor } from './drop-band';

// Row geometry read from the official editor: six single-line blocks, row height
// 28 and pitch 36, so each row is followed by an 8px gutter.
const rows = [
  { top: 173, bottom: 201 },
  { top: 209, bottom: 237 },
  { top: 245, bottom: 273 },
  { top: 281, bottom: 309 },
  { top: 317, bottom: 345 },
  { top: 353, bottom: 381 },
];

describe('dropTargetFor', () => {
  it('counts the gutter under a row as that row', () => {
    expect(dropTargetFor(205, rows)).toEqual({ index: 0, before: false });
  });

  it('keeps the midline as the before/after boundary, midpoint included', () => {
    expect(dropTargetFor(187, rows)).toEqual({ index: 0, before: true });
    expect(dropTargetFor(188, rows)).toEqual({ index: 0, before: false });
  });

  it('clamps a drop above the first row to the very front', () => {
    expect(dropTargetFor(150, rows)).toEqual({ index: 0, before: true });
  });

  it('accepts the trailing gutter of the last row', () => {
    expect(dropTargetFor(385, rows)).toEqual({ index: 5, before: false });
  });

  it('has no slot below the last band', () => {
    expect(dropTargetFor(399, rows)).toBeNull();
  });

  it('has no slot without rows', () => {
    expect(dropTargetFor(200, [])).toBeNull();
  });
});
