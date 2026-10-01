import { describe, expect, it } from 'vitest';
import { serializeDocument } from '../document-codec';
import { parseMarkdown, pickTextBundleEntry, titleFromMarkdown } from './markdown';

const blocks = (source: string): any[] => parseMarkdown(source).content ?? [];

describe('parseMarkdown blocks', () => {
  it('turns plain lines into one paragraph', () => {
    const [first] = blocks('第一行\n第二行');
    expect(first).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: '第一行 第二行' }],
    });
  });

  it('reads heading levels', () => {
    const result = blocks('## 二级\n###### 六级');
    expect(result.map((node) => node.attrs?.level)).toEqual([2, 6]);
    expect(result[0].type).toBe('heading');
  });

  it('separates blocks by blank lines', () => {
    expect(blocks('甲\n\n乙')).toHaveLength(2);
  });

  it('builds a nested bullet list from indentation', () => {
    const [list] = blocks('- 一\n  - 二\n- 三');
    expect(list.type).toBe('bulletList');
    expect(list.content).toHaveLength(2);
    expect(list.content[0].content[0].content).toEqual([{ type: 'text', text: '一' }]);
    expect(list.content[0].content[1]?.type).toBe('bulletList');
  });

  it('builds an ordered list', () => {
    const [list] = blocks('1. 甲\n2. 乙');
    expect(list.type).toBe('orderedList');
    expect(list.content).toHaveLength(2);
  });

  it('keeps task checkboxes', () => {
    const [list] = blocks('- [x] 已完成\n- [ ] 未完成');
    expect(list.type).toBe('taskList');
    expect(list.content.map((item: any) => item.attrs?.checked)).toEqual([true, false]);
  });

  it('wraps a blockquote around its paragraphs', () => {
    const [quote] = blocks('> 引用一\n> 引用二');
    expect(quote.type).toBe('blockquote');
    expect(quote.content[0].content[0].text).toBe('引用一 引用二');
  });

  it('normalizes the fence language to the code Craft stores', () => {
    const [code] = blocks('```ts\nconst a = 1;\n```');
    expect(code).toEqual({
      type: 'codeBlock',
      attrs: { language: 'typescript' },
      content: [{ type: 'text', text: 'const a = 1;' }],
    });
  });

  it('folds extension aliases the way Craft names a language', () => {
    const langs = (source: string) => blocks(source).map((node) => node.attrs?.language);
    expect(langs('```py\nx\n```')).toEqual(['python']);
    expect(langs('```tsx\nx\n```')).toEqual(['typescript']);
    expect(langs('```tex\nx\n```')).toEqual(['math_formula']);
    expect(langs('```hbs\nx\n```')).toEqual(['html']);
  });

  it('takes only the first word of the fence info string', () => {
    expect(blocks('```ts title="a.ts"\nx\n```')[0].attrs?.language).toBe('typescript');
  });

  it('keeps mermaid even though it is not an alias', () => {
    expect(blocks('```mermaid\ngraph TD\n```')[0].attrs?.language).toBe('mermaid');
  });

  it('falls back to other for a language Craft does not name', () => {
    expect(blocks('```qqqlang\nx\n```')[0].attrs?.language).toBe('other');
  });

  it('leaves an info-less fence without a language', () => {
    // Characterization: the official importer is not measured for this shape yet.
    expect(blocks('```\nx\n```')[0].attrs?.language).toBeNull();
  });

  it('emits a divider for a rule line', () => {
    expect(blocks('---')[0].type).toBe('divider');
    expect(blocks('***')[0].type).toBe('divider');
  });

  it('lifts a lone image into an image block', () => {
    expect(blocks('![封面](https://example.com/a.png)')[0]).toMatchObject({
      type: 'imageBlock',
      attrs: { src: 'https://example.com/a.png', alt: '封面' },
    });
  });

  it('always returns a document with at least one block', () => {
    expect(parseMarkdown('').content).toEqual([{ type: 'paragraph' }]);
  });
});

describe('parseMarkdown inline marks', () => {
  const inline = (source: string) => (blocks(source)[0].content ?? []);

  it('marks bold, italic, code and strike', () => {
    expect(inline('**粗**')).toEqual([{ type: 'text', text: '粗', marks: [{ type: 'bold' }] }]);
    expect(inline('*斜*')).toEqual([{ type: 'text', text: '斜', marks: [{ type: 'italic' }] }]);
    expect(inline('`码`')).toEqual([{ type: 'text', text: '码', marks: [{ type: 'code' }] }]);
    expect(inline('~~删~~')).toEqual([{ type: 'text', text: '删', marks: [{ type: 'strike' }] }]);
  });

  it('marks a link and keeps its label', () => {
    expect(inline('[官网](https://craft.do)')).toEqual([
      { type: 'text', text: '官网', marks: [{ type: 'link', attrs: { href: 'https://craft.do' } }] },
    ]);
  });

  it('nests emphasis inside bold', () => {
    expect(inline('**粗 *斜***')).toEqual([
      { type: 'text', text: '粗 ', marks: [{ type: 'bold' }] },
      { type: 'text', text: '斜', marks: [{ type: 'bold' }, { type: 'italic' }] },
    ]);
  });

  it('leaves unbalanced punctuation as text', () => {
    expect(inline('2 * 3 * 4')).toEqual([{ type: 'text', text: '2 * 3 * 4' }]);
  });
});

describe('document title and text bundles', () => {
  it('uses the first heading, then the first line', () => {
    expect(titleFromMarkdown('# 标题\n正文')).toBe('标题');
    expect(titleFromMarkdown('只有正文')).toBe('只有正文');
    expect(titleFromMarkdown('')).toBe('导入的笔记');
  });

  it('finds text.md inside the shallowest bundle folder', () => {
    expect(
      pickTextBundleEntry([
        'note.textbundle/text.md',
        'note.textbundle/assets/a.png',
        'deep/nested.textbundle/text.md',
      ])
    ).toBe('note.textbundle/text.md');
  });

  it('returns null when no bundle entry exists', () => {
    expect(pickTextBundleEntry(['a.md', 'b.txt'])).toBeNull();
  });
});

describe('re-importing what the Craft-shaped exporter writes', () => {
  it('re-imports Craft three-space indentation as a nested list', () => {
    // Guard for the exporter, which emits `indentationCharacters` = three spaces.
    const [list] = blocks('- 父项\n   - 子项');
    expect(list.type).toBe('bulletList');
    const parent = list.content[0];
    expect(parent.content[0].content[0].text).toBe('父项');
    expect(parent.content[1]?.type).toBe('bulletList');
    expect(parent.content[1]?.content[0].content[0].content[0].text).toBe('子项');
  });

  it('accepts the uppercase checked marker Craft exports', () => {
    const [list] = blocks('- [X] 已完成');
    expect(list.type).toBe('taskList');
    expect(list.content[0].attrs?.checked).toBe(true);
  });

  it('reads a display-math fence as a math block', () => {
    const [math] = blocks('$$\n\\frac{a}{b}\n$$');
    expect(math).toEqual({ type: 'mathBlock', attrs: { latex: '\\frac{a}{b}' } });
  });

  it('reads a single-line display-math fence', () => {
    const [math] = blocks('$$x^2$$');
    expect(math.type).toBe('mathBlock');
    expect(math.attrs?.latex).toBe('x^2');
  });

  it('ends a paragraph where a display-math fence opens', () => {
    expect(blocks('正文\n$$\nx\n$$').map((node) => node.type)).toEqual(['paragraph', 'mathBlock']);
  });

  it('round-trips a math block through the markdown exporter', () => {
    const markdown = serializeDocument(
      { type: 'doc', content: [{ type: 'mathBlock', attrs: { latex: 'a^2 + b^2' } }] },
      'markdown'
    );
    expect(blocks(markdown)[0]).toEqual({ type: 'mathBlock', attrs: { latex: 'a^2 + b^2' } });
  });
});
