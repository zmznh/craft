import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(fileURLToPath(new URL('../../app/globals.css', import.meta.url)), 'utf8');
const darkBlock = /(^|\n)\s*\.dark\s*\{([\s\S]*?)\n\s*\}/.exec(css)?.[2] ?? '';

function declared(name: string, src = css) {
  return new RegExp('--' + name + '\\s*:\\s*([^;]+);').exec(src)?.[1]?.trim();
}

/** The `pre { … }` block nested inside `.tiptap`, brace-balanced. */
function preBlock(): string {
  const tiptap = css.indexOf('.tiptap {');
  const start = css.indexOf('pre {', tiptap);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) return css.slice(start, i + 1);
    }
  }
  throw new Error('no pre block found');
}

function selectorTokens(block: string): string[] {
  return [...block.matchAll(/\.hljs-[a-z0-9_.]+/gi)].map((m) => m[0].slice(1));
}

function tokenRules(block: string): string[] {
  return block.match(/\.hljs-[^{}]*\{[^{}]*\}/g) ?? [];
}

/**
 * craft.do 的 `auto` 档在亮／暗界面下分别解析到 craftlight／craftdark，
 * 这两档的 styles 数组逐字来自 vendor-code-editor 的工厂 io 与 fo。
 */
const PALETTE = [
  ['code-background', '#FBFBFB', '#28292B'],
  ['code-foreground', '#3D3D3D', '#CECFD0'],
  ['code-comment', '#6a737d', '#8b949e'],
  ['code-symbol', '#6f42c1', '#d2a8ff'],
  ['code-literal', '#005cc5', '#79c0ff'],
  ['code-keyword', '#d73a49', '#ff7b72'],
  ['code-string', '#032f62', '#a5d6ff'],
  ['code-tag', '#22863a', '#7ee787'],
  ['code-heading', '#24292e', '#d2a8ff'],
  ['code-deleted', '#b31d28', '#ffdcd7'],
] as const;

/** 官方 lezer tag 组 → lowlight（highlight.js）实际发出的类名。 */
const GROUPS = [
  ['code-comment', ['hljs-comment', 'hljs-punctuation', 'hljs-tag']],
  ['code-symbol', ['hljs-title.class_', 'hljs-selector-class', 'hljs-attribute']],
  ['code-literal', ['hljs-attr', 'hljs-variable', 'hljs-number', 'hljs-operator', 'hljs-params']],
  ['code-keyword', ['hljs-keyword', 'hljs-type', 'hljs-built_in']],
  ['code-string', ['hljs-string', 'hljs-meta', 'hljs-code', 'hljs-bullet']],
  ['code-tag', ['hljs-name', 'hljs-quote']],
  ['code-heading', ['hljs-section', 'hljs-emphasis']],
  ['code-deleted', ['hljs-deletion']],
] as const;

/** craftlight／craftdark 两档根本没有这些 tag ⇒ 继承前景，本地也不许擅自上色。 */
const UNSTYLED = [
  'hljs-literal',
  'hljs-strong',
  'hljs-link',
  'hljs-addition',
  'hljs-title',
  'hljs-title.function_',
  'hljs-function',
  'hljs-selector-tag',
  'hljs-doctag',
];

describe('代码块 token 配色层＝官方 craftlight／craftdark 两档逐字（gap G1163）', () => {
  it.each(PALETTE)('--%s 在 :root 要等于官方 craftlight 逐字值 %s', (name, light) => {
    expect(declared(name)).toBe(light);
  });

  it.each(PALETTE)('--%s 在 .dark 要重指成官方 craftdark 逐字值 %s', (name, _light, dark) => {
    expect(declared(name, darkBlock)).toBe(dark);
  });

  it('每组成员类名都要消费自己那一组的 token', () => {
    const rules = tokenRules(preBlock());
    const missing = GROUPS.flatMap(([token, classes]) =>
      classes.filter((cls) => {
        const hit = rules.filter((r) => r.split('{')[0].split(',').some((s) => s.trim() === '.' + cls));
        return hit.length === 0 || !hit.every((r) => r.includes('var(--' + token + ')'));
      }),
    );
    expect(missing).toEqual([]);
  });

  it('官方两档没着色的类名，本地也不着色', () => {
    const used = new Set(selectorTokens(preBlock()));
    expect([...used].filter((c) => UNSTYLED.includes(c))).toEqual([]);
  });

  it('官方 deleted 的底色串是非法 CSS（ffeef0 缺 #）⇒ 本地只写前景', () => {
    expect(declared('code-deleted')).toBe('#b31d28');
    expect(css.replace(/\/\*[\s\S]*?\*\//g, '')).not.toContain('ffeef0');
    expect(preBlock()).not.toMatch(/hljs-deletion[^}]*background/);
  });
});
