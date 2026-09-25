import { describe, expect, it } from 'vitest';
import { canAccessResource, resolveResourceRole } from './resource';

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

  it('ranks editor above commenter above viewer', () => {
    const members = [{ userId: 'u2', role: 'editor' as const }];
    expect(canAccessResource({ id: 'u2' }, { ownerId: 'u1', members }, 'commenter')).toBe(true);
    expect(canAccessResource({ id: 'u2' }, { ownerId: 'u1', members }, 'owner')).toBe(false);
  });

  it('rejects an anonymous actor', () => {
    expect(canAccessResource(null, { ownerId: 'u1' }, 'viewer')).toBe(false);
    expect(resolveResourceRole(undefined, { ownerId: 'u1' })).toBeNull();
  });
});

describe('resolveResourceRole', () => {
  it('prefers owner over a member row for the same user', () => {
    const resource = { ownerId: 'u1', members: [{ userId: 'u1', role: 'viewer' as const }] };
    expect(resolveResourceRole({ id: 'u1' }, resource)).toBe('owner');
  });

  it('returns the member role when the actor is not the owner', () => {
    const resource = { ownerId: 'u1', members: [{ userId: 'u2', role: 'commenter' as const }] };
    expect(resolveResourceRole({ id: 'u2' }, resource)).toBe('commenter');
  });

  it('returns null for users without access', () => {
    expect(resolveResourceRole({ id: 'u3' }, { ownerId: 'u1' })).toBeNull();
  });
});
