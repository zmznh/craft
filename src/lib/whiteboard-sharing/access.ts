export type WhiteboardSharePermission = 'off' | 'view' | 'edit';
export type WhiteboardRole = 'owner' | 'editor' | 'viewer';

export const SHARE_PERMISSIONS: WhiteboardSharePermission[] = ['off', 'view', 'edit'];

export function isSharePermission(value: unknown): value is WhiteboardSharePermission {
  return typeof value === 'string' && SHARE_PERMISSIONS.includes(value as WhiteboardSharePermission);
}

/**
 * The role a visitor gets for a board. Owners always edit; a share link grants at
 * most what its permission allows, and editing additionally requires a user id.
 */
export function resolveShareRole(input: {
  permission: WhiteboardSharePermission;
  isOwner: boolean;
  userId: string | null;
}): WhiteboardRole | null {
  if (input.isOwner) return 'owner';
  if (input.permission === 'off') return null;
  if (input.permission === 'edit' && input.userId) return 'editor';
  return 'viewer';
}

/**
 * Whether a resolved role may open a sync connection. `resolveShareRole` is the
 * only thing that can produce `owner`, so an owner here really is the board owner
 * and always keeps access; the other roles require a live share link.
 */
export function canOpenWhiteboardShare(
  permission: WhiteboardSharePermission,
  requestedRole: WhiteboardRole,
): boolean {
  if (requestedRole === 'owner') return true;
  if (permission === 'off') return false;
  if (requestedRole === 'editor') return permission === 'edit';
  return true;
}

export function canWriteAsRole(role: WhiteboardRole): boolean {
  return role === 'owner' || role === 'editor';
}
