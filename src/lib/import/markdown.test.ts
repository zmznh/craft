import { describe, expect, it } from 'vitest';
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

  it('keeps the fence language', () => {
    const [code] = blocks('```ts\nconst a = 1;\n```');
    expect(code).toEqual({
      type: 'codeBlock',
      attrs: { language: 'ts' },
      content: [{ type: 'text', text: 'const a = 1;' }],
    });
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
