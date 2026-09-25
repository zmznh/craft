import { describe, expect, it } from 'vitest';
import {
  canOpenWhiteboardShare,
  canWriteAsRole,
  isSharePermission,
  resolveShareRole,
} from './access';

describe('resolveShareRole', () => {
  it('keeps the owner editing regardless of the share setting', () => {
    expect(resolveShareRole({ permission: 'off', isOwner: true, userId: 'u1' })).toBe('owner');
  });

  it('refuses anonymous and logged-in visitors when sharing is off', () => {
    const base = { permission: 'off' as const, isOwner: false };
    expect(resolveShareRole({ ...base, userId: null })).toBeNull();
    expect(resolveShareRole({ ...base, userId: 'u2' })).toBeNull();
  });

  it('lets anyone read a view link but never edit it', () => {
    expect(resolveShareRole({ permission: 'view', isOwner: false, userId: null })).toBe('viewer');
    expect(resolveShareRole({ permission: 'view', isOwner: false, userId: 'u2' })).toBe('viewer');
  });

  it('requires a login to edit, and falls back to read-only for anonymous visitors', () => {
    expect(resolveShareRole({ permission: 'edit', isOwner: false, userId: 'u2' })).toBe('editor');
    expect(resolveShareRole({ permission: 'edit', isOwner: false, userId: null })).toBe('viewer');
  });
});

describe('canOpenWhiteboardShare', () => {
  it('keeps the owner in their own board at every permission level', () => {
    expect(canOpenWhiteboardShare('off', 'owner')).toBe(true);
    expect(canOpenWhiteboardShare('view', 'owner')).toBe(true);
    expect(canOpenWhiteboardShare('edit', 'owner')).toBe(true);
  });

  it('grants visitors nothing once the link is closed', () => {
    expect(canOpenWhiteboardShare('off', 'viewer')).toBe(false);
    expect(canOpenWhiteboardShare('off', 'editor')).toBe(false);
    expect(canOpenWhiteboardShare('view', 'viewer')).toBe(true);
    expect(canOpenWhiteboardShare('view', 'editor')).toBe(false);
    expect(canOpenWhiteboardShare('edit', 'viewer')).toBe(true);
    expect(canOpenWhiteboardShare('edit', 'editor')).toBe(true);
  });
});

describe('canWriteAsRole', () => {
  it('allows owner and editor only', () => {
    expect(canWriteAsRole('owner')).toBe(true);
    expect(canWriteAsRole('editor')).toBe(true);
    expect(canWriteAsRole('viewer')).toBe(false);
  });
});

describe('isSharePermission', () => {
  it('accepts only the three known values', () => {
    expect(['off', 'view', 'edit'].every(isSharePermission)).toBe(true);
    expect(isSharePermission('public')).toBe(false);
    expect(isSharePermission(undefined)).toBe(false);
  });
});
