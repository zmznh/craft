import { afterEach, describe, expect, it } from 'vitest';
import { MIN_SECRET_LENGTH, requireSecret } from './secret';

const env = process.env as Record<string, string | undefined>;
const original: Record<string, string | undefined> = {};

function setEnv(name: string, value: string | undefined) {
  if (!(name in original)) original[name] = env[name];
  if (value === undefined) delete env[name];
  else env[name] = value;
}

afterEach(() => {
  for (const [name, value] of Object.entries(original)) env[name] = value;
});

describe('requireSecret', () => {
  it('returns the first usable candidate', () => {
    setEnv('SECRET_A', 'a'.repeat(MIN_SECRET_LENGTH));
    setEnv('SECRET_B', 'b'.repeat(MIN_SECRET_LENGTH));
    expect(requireSecret(['SECRET_A', 'SECRET_B'])).toBe('a'.repeat(MIN_SECRET_LENGTH));
  });

  it('skips a too-short candidate', () => {
    setEnv('SECRET_A', 'nope');
    setEnv('SECRET_B', 'b'.repeat(MIN_SECRET_LENGTH));
    expect(requireSecret(['SECRET_A', 'SECRET_B'])).toBe('b'.repeat(MIN_SECRET_LENGTH));
  });

  it('throws instead of falling back to a shared dev default', () => {
    setEnv('SECRET_A', undefined);
    setEnv('SECRET_B', '');
    expect(() => requireSecret(['SECRET_A', 'SECRET_B'])).toThrow(/缺少签名密钥/);
  });
});
