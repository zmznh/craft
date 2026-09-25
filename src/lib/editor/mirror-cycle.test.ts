import { describe, expect, it } from 'vitest';
import { findMirrorCycle } from './mirror-cycle';

const mirror = (documentId: string, content: unknown[] = []): any => ({
  type: 'mirrorBlock',
  attrs: { sourceDocumentId: documentId, sourceBlockId: `${documentId}-block` },
  content,
});

describe('findMirrorCycle', () => {
  it('catches a mirror that points straight back at the host document', () => {
    const block = { type: 'paragraph', content: [mirror('A')] };
    expect(findMirrorCycle(block, 'A')).toEqual({ documentId: 'A', blockId: 'A-block' });
  });

  it('catches a mirror nested inside the mirrored block', () => {
    const block = mirror('B', [{ type: 'paragraph', content: [mirror('A')] }]);
    expect(findMirrorCycle(block, 'A')?.documentId).toBe('A');
  });

  it('catches a loop that closes through a third document', () => {
    const block = mirror('B', [mirror('C', [mirror('A')])]);
    expect(findMirrorCycle(block, 'A')?.documentId).toBe('A');
  });

  it('catches a document visited twice', () => {
    const block = mirror('B', [mirror('C', [mirror('B')])]);
    expect(findMirrorCycle(block, 'A')?.documentId).toBe('B');
  });

  it('leaves an ordinary block alone', () => {
    const block = { type: 'paragraph', content: [{ type: 'text', text: '普通段落' }] };
    expect(findMirrorCycle(block, 'A')).toBeNull();
  });

  it('stops walking rather than recursing forever on a long chain', () => {
    let block: any = mirror('B');
    for (let i = 0; i < 12; i += 1) block = mirror(`doc-${i}`, [block]);
    expect(findMirrorCycle(block, 'A')).toBeNull();
  });
});
