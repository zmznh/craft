import { describe, expect, it } from 'vitest';
import { anchorHref, readAnchorHash } from './block-anchor';

const ID = '3f2a6b1c-9d0e-4f5a-8b7c-1d2e3f4a5b6c';

describe('readAnchorHash', () => {
  it('reads an id anchor', () => {
    expect(readAnchorHash(`#b-${ID}`)).toEqual({ kind: 'id', blockId: ID });
  });

  it('reads a positional anchor', () => {
    expect(readAnchorHash('#i-3')).toEqual({ kind: 'index', blockIndex: 3 });
  });

  it('ignores hashes that are not block anchors', () => {
    expect(readAnchorHash('#section-2')).toBeNull();
    expect(readAnchorHash('')).toBeNull();
    expect(readAnchorHash(undefined)).toBeNull();
  });

  it('rejects ids that are not UUIDs instead of interpolating them into a selector', () => {
    expect(readAnchorHash('#b-"><img src=x>')).toBeNull();
    expect(readAnchorHash('#i-1;drop')).toBeNull();
    expect(readAnchorHash(`#b-${ID.toUpperCase()}`)).toEqual({ kind: 'id', blockId: ID.toUpperCase() });
  });

  it('rejects a value that does not decode', () => {
    expect(readAnchorHash('#b-%zz')).toBeNull();
  });
});

describe('anchorHref', () => {
  it('prefers the stable id over the position', () => {
    expect(anchorHref({ documentId: 'd-1', blockId: ID, blockIndex: 2 })).toBe(`/documents/d-1#b-${ID}`);
  });

  it('falls back to the position, then to the bare document', () => {
    expect(anchorHref({ documentId: 'd-1', blockId: null, blockIndex: 2 })).toBe('/documents/d-1#i-2');
    expect(anchorHref({ documentId: 'd-1' })).toBe('/documents/d-1');
  });
});
