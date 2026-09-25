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

export function resolveResourceRole(
  actor: { id: string } | null | undefined,
  resource: ResourceAccess,
): ResourceRole | null {
  if (!actor) return null;
  if (actor.id === resource.ownerId) return 'owner';
  return resource.members?.find((member) => member.userId === actor.id)?.role ?? null;
}

export function roleSatisfies(role: ResourceRole, required: AccessLevel): boolean {
  return roleRank[role] >= roleRank[required];
}

export function canAccessResource(
  actor: { id: string } | null | undefined,
  resource: ResourceAccess,
  required: AccessLevel,
): boolean {
  const role = resolveResourceRole(actor, resource);
  return role !== null && roleRank[role] >= roleRank[required];
}
