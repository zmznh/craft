import { describe, expect, it } from 'vitest';
import { DIVIDER_PATTERN, DIVIDER_SIGILS } from './divider';

function styleFor(typed: string): string | undefined {
  const match = DIVIDER_PATTERN.exec(typed);
  return match ? DIVIDER_SIGILS[match[1]] : undefined;
}

describe('divider sigils', () => {
  it('maps each of the four weights', () => {
    expect(styleFor('..-')).toBe('thin');
    expect(styleFor('.--')).toBe('medium');
    expect(styleFor('---')).toBe('thick');
    expect(styleFor('=-')).toBe('dashed');
  });

  it('accepts the en/em dash forms typography leaves behind', () => {
    expect(styleFor('–-')).toBe('thick');
    expect(styleFor('—-')).toBe('thick');
  });

  it('does not let one sigil swallow another', () => {
    expect(styleFor('--')).toBeUndefined();
    expect(styleFor('.-')).toBeUndefined();
    expect(styleFor('....-')).toBeUndefined();
    expect(styleFor('a.-')).toBeUndefined();
    expect(styleFor('==')).toBeUndefined();
    expect(styleFor('--- ')).toBeUndefined();
  });
});
