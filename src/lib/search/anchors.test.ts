import { describe, expect, it } from 'vitest';
import { collectAnchorCandidates, findBlockById, nthAnchorableBlock } from './anchors';

const doc: any = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '标题' }] },
    { type: 'paragraph', content: [{ type: 'text', text: '第一段' }] },
    {
      type: 'cardBlock',
      content: [{ type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '嵌套项' }] }] }] }],
    },
    { type: 'paragraph', attrs: { blockId: 'given' }, content: [{ type: 'text', text: '已有 id' }] },
    { type: 'paragraph' },
  ],
};

describe('collectAnchorCandidates', () => {
  it('lists anchorable blocks in document order, including nested ones', () => {
    expect(collectAnchorCandidates(doc).map((c) => c.text)).toEqual([
      '标题',
      '第一段',
      '嵌套项',
      '已有 id',
    ]);
  });

  it('skips empty blocks and reports an existing id', () => {
    const candidates = collectAnchorCandidates(doc);
    expect(candidates.some((c) => c.text === '')).toBe(false);
    expect(candidates[3].blockId).toBe('given');
  });

  it('carries the heading level', () => {
    expect(collectAnchorCandidates(doc)[0].level).toBe(1);
  });

  it('numbers nested blocks after top level ones', () => {
    const candidates = collectAnchorCandidates(doc);
    expect(candidates.map((c) => c.index)).toEqual([0, 1, 2, 3]);
    expect(candidates[2].text).toBe('嵌套项');
  });
});

describe('nthAnchorableBlock', () => {
  it('returns the same nodes the collector numbered', () => {
    expect(nthAnchorableBlock(doc, 0)?.type).toBe('heading');
    expect(nthAnchorableBlock(doc, 1)?.content[0].text).toBe('第一段');
    expect(nthAnchorableBlock(doc, 2)?.content[0].text).toBe('嵌套项');
  });

  it('skips empty blocks', () => {
    expect(nthAnchorableBlock(doc, 3)?.content[0].text).toBe('已有 id');
    expect(nthAnchorableBlock(doc, 4)).toBeNull();
  });
});

describe('findBlockById', () => {
  it('finds a nested block by its id', () => {
    expect(findBlockById(doc, 'given')?.content[0].text).toBe('已有 id');
  });

  it('ignores a block whose text merely equals an id', () => {
    expect(findBlockById(doc, '第一段')).toBeNull();
  });

  it('returns null for an unknown id', () => {
    expect(findBlockById(doc, 'missing')).toBeNull();
  });
});
