import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(fileURLToPath(new URL('../../app/globals.css', import.meta.url)), 'utf8');
const darkBlock = /(^|\n)\s*\.dark\s*\{([\s\S]*?)\n\s*\}/.exec(css)?.[2] ?? '';

function token(name: string) {
  const re = new RegExp('--' + name + '\\s*:\\s*([^;]+);');
  const inDark = re.exec(darkBlock)?.[1]?.trim().replace(/\s+/g, ' ');
  const inRoot = re.exec(css)?.[1]?.trim().replace(/\s+/g, ' ');
  return { inDark, inRoot };
}

describe('暗档语法色＝官方逐字值（gap G1068）', () => {
  it('--editor-blueDark 在暗档要重指成 rgb(170 169 249)', () => {
    expect(token('editor-blueDark')).toEqual({ inDark: 'rgb(170 169 249)', inRoot: 'rgb(3 0 245)' });
  });

  it('--editor-blueLight 在暗档要重指成 rgb(65 146 247)', () => {
    expect(token('editor-blueLight')).toEqual({ inDark: 'rgb(65 146 247)', inRoot: 'rgb(41 98 246)' });
  });
});
