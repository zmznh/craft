import { describe, expect, it } from 'vitest';
import { dropBandFor } from './drop-band';

// Row geometry read from the official editor: a tall block spanning y 209..329 (midline 269)
// and a single 28px row (midline top + 14).
const tall = { top: 209, bottom: 329, height: 120 };
const row = { top: 173, bottom: 201, height: 28 };

describe('dropBandFor', () => {
  it('lands after only when strictly past the midline', () => {
    expect(dropBandFor(269, tall)).toBe('before');
    expect(dropBandFor(270, tall)).toBe('after');
  });

  it('keeps the four measured above-midline drops on the after side', () => {
    for (const y of [277, 285, 299]) expect(dropBandFor(y, tall)).toBe('after');
  });

  it('treats the visual center of a short row as its midline', () => {
    expect(dropBandFor(187, row)).toBe('before');
    expect(dropBandFor(188, row)).toBe('after');
  });

  it('stays inside the row and reports the gap outside it', () => {
    expect(dropBandFor(209, tall)).toBe('before');
    expect(dropBandFor(329, tall)).toBe('after');
    expect(dropBandFor(208, tall)).toBe('none');
    expect(dropBandFor(330, tall)).toBe('none');
  });
});
