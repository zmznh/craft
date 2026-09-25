'use server';

import { getTable, requireUserId } from '@/lib/authz/guard';
import { requireDocumentAccess } from '@/lib/authz/document-access';

export type MemberRole = 'editor' | 'commenter' | 'viewer';

const MEMBER_ROLES: MemberRole[] = ['editor', 'commenter', 'viewer'];

export interface DocumentMemberItem {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  role: MemberRole;
}

function assertRole(role: unknown): MemberRole {
  if (!MEMBER_ROLES.includes(role as MemberRole)) throw new Error('无效的协作者权限');
  return role as MemberRole;
}

export async function listDocumentMembers(documentId: string): Promise<DocumentMemberItem[]> {
  const userId = await requireUserId();
  await requireDocumentAccess(documentId, userId, 'viewer');

  const rows = await (await getTable('DocumentMember')).where({ documentId }).all();
  const users = await getTable('User');

  const items: DocumentMemberItem[] = [];
  for (const row of rows) {
    const account = await users.first({ id: row.userId as string });
    items.push({
      id: row.id as string,
      userId: row.userId as string,
      name: (account?.name as string) ?? null,
      email: (account?.email as string) ?? '',
      role: row.role as MemberRole,
    });
  }
  return items;
}

export async function addDocumentMember(input: {
  documentId: string;
  email: string;
  role: unknown;
}): Promise<DocumentMemberItem> {
  const userId = await requireUserId();
  const { document } = await requireDocumentAccess(input.documentId, userId, 'owner');
  const role = assertRole(input.role);

  const email = input.email.trim().toLowerCase();
  const users = await getTable('User');
  const account = await users.first({ email });
  if (!account) throw new Error('该邮箱尚未注册 Crafty');
  if (account.id === document.userId) throw new Error('文档所有者无需添加为协作者');

  const members = await getTable('DocumentMember');
  const existing = await members.first({ documentId: input.documentId, userId: account.id as string });
  if (existing) {
    await members.where({ id: existing.id as string }).update({ role });
    return {
      id: existing.id as string,
      userId: account.id as string,
      name: (account.name as string) ?? null,
      email,
      role,
    };
  }

  const created = await members.create({
    id: crypto.randomUUID(),
    documentId: input.documentId,
    userId: account.id,
    role,
    addedBy: userId,
  });

  return {
    id: created.id as string,
    userId: account.id as string,
    name: (account.name as string) ?? null,
    email,
    role,
  };
}

export async function updateDocumentMemberRole(memberId: string, role: unknown) {
  const userId = await requireUserId();
  const members = await getTable('DocumentMember');
  const member = await members.first({ id: memberId });
  if (!member) throw new Error('协作者不存在');
  await requireDocumentAccess(member.documentId as string, userId, 'owner');

  await members.where({ id: memberId }).update({ role: assertRole(role) });
}

export async function removeDocumentMember(memberId: string) {
  const userId = await requireUserId();
  const members = await getTable('DocumentMember');
  const member = await members.first({ id: memberId });
  if (!member) return;
  await requireDocumentAccess(member.documentId as string, userId, 'owner');

  await members.where({ id: memberId }).delete();
}
