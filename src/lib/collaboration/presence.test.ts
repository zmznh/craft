import { describe, expect, it } from 'vitest';
import { colorForUserId, initialPresenceState, selectPeers } from './presence';

describe('colorForUserId', () => {
  it('is stable for the same user', () => {
    expect(colorForUserId('user-1')).toBe(colorForUserId('user-1'));
  });

  it('returns a hex colour from the palette', () => {
    for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']) {
      expect(colorForUserId(id)).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('spreads users across more than one colour', () => {
    const colors = new Set(Array.from({ length: 40 }, (_, i) => colorForUserId(`u${i}`)));
    expect(colors.size).toBeGreaterThan(2);
  });
});

describe('selectPeers', () => {
  const user = { id: 'u2', name: '李四', color: '#4a7de0' };
  const states = new Map<number, ReturnType<typeof initialPresenceState>>([
    [1, initialPresenceState({ id: 'u1', name: '张三', color: '#e0596b' })],
    [2, { user, cursor: { anchor: { position: 4 }, head: { position: 4 } } }],
    [3, { user: undefined }],
  ]);

  it('drops the local client and states without a user', () => {
    const peers = selectPeers(states, 1);
    expect(peers).toHaveLength(1);
    expect(peers[0].clientId).toBe(2);
    expect(peers[0].user.name).toBe('李四');
  });

  it('normalises a missing cursor to null so peers render before they move', () => {
    const withCursor = new Map([[7, initialPresenceState(user)]]);
    expect(selectPeers(withCursor, 1)[0].cursor).toBeNull();
  });
});
