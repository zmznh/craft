export type ResourceRole = 'owner' | 'editor' | 'commenter' | 'viewer';
export type AccessLevel = 'viewer' | 'commenter' | 'editor' | 'owner';

export interface ResourceMember {
  userId: string;
  role: Exclude<ResourceRole, 'owner'>;
}

export interface ResourceAccess {
  ownerId: string;
  members?: ResourceMember[];
}

const roleRank: Record<ResourceRole, number> = {
  viewer: 1,
  commenter: 2,
  editor: 3,
  owner: 4,
};

export function canAccessResource(
  actor: { id: string } | null | undefined,
  resource: ResourceAccess,
  required: AccessLevel,
): boolean {
  if (!actor) return false;

  const role = actor.id === resource.ownerId
    ? 'owner'
    : resource.members?.find((member) => member.userId === actor.id)?.role;

  return role !== undefined && roleRank[role] >= roleRank[required];
}
