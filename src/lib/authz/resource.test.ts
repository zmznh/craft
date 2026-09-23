import { describe, expect, it } from 'vitest';
import { canAccessResource } from './resource';

describe('canAccessResource', () => {
  it('allows an owner to edit their resource', () => {
    expect(canAccessResource({ id: 'u1' }, { ownerId: 'u1' }, 'editor')).toBe(true);
  });

  it('does not allow a different user to read an owned resource', () => {
    expect(canAccessResource({ id: 'u2' }, { ownerId: 'u1' }, 'viewer')).toBe(false);
  });

  it('allows a viewer to read but not edit', () => {
    const resource = { ownerId: 'u1', members: [{ userId: 'u2', role: 'viewer' as const }] };
    expect(canAccessResource({ id: 'u2' }, resource, 'viewer')).toBe(true);
    expect(canAccessResource({ id: 'u2' }, resource, 'editor')).toBe(false);
  });
});
