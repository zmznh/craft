'use server';

import { auth } from '@/lib/auth/auth';
import { requireDocumentAccess } from '@/lib/authz/document-access';
import { getDb } from '@/prisma/db';
import { revalidatePath } from 'next/cache';

async function assertDocumentAccess(
  documentId: string,
  userId: string,
  need: 'viewer' | 'commenter' | 'editor',
) {
  await requireDocumentAccess(documentId, userId, need);
}

export async function createThread(
  documentId: string,
  data: { blockId?: string; blockText?: string; body: string }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');
  const body = data.body.trim();
  if (!body) throw new Error('评论不能为空');

  const db = await getDb();
  await assertDocumentAccess(documentId, session.user.id, 'commenter');

  const threadId = crypto.randomUUID();
  await db.orm.public.CommentThread.create({
    id: threadId,
    documentId,
    blockId: data.blockId ?? null,
    blockText: (data.blockText ?? '').slice(0, 500),
  });
  await db.orm.public.Comment.create({
    id: crypto.randomUUID(),
    threadId,
    userId: session.user.id,
    body: body.slice(0, 2000),
  });
  revalidatePath(`/documents/${documentId}`);
  return { threadId };
}

export async function getThreads(documentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  await assertDocumentAccess(documentId, session.user.id, 'viewer');

  const threads = await db.orm.public.CommentThread
    .where({ documentId })
    .orderBy((t: any) => t.createdAt.asc())
    .all();

  const result = [];
  for (const thread of threads) {
    const row = thread as any;
    const comments = await db.orm.public.Comment
      .where({ threadId: row.id })
      .orderBy((c: any) => c.createdAt.asc())
      .all();
    result.push({
      id: row.id,
      documentId: row.documentId,
      blockId: row.blockId,
      blockText: row.blockText,
      resolved: row.resolved,
      comments: comments.map((c: any) => ({
        id: c.id,
        userId: c.userId,
        body: c.body,
        createdAt: c.createdAt,
        mine: c.userId === session.user.id,
      })),
    });
  }
  return result;
}

export async function addReply(threadId: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');
  const text = body.trim();
  if (!text) throw new Error('评论不能为空');

  const db = await getDb();
  const thread = await db.orm.public.CommentThread.first({ id: threadId });
  if (!thread) throw new Error('评论不存在');
  await assertDocumentAccess((thread as { documentId: string }).documentId, session.user.id, 'commenter');

  await db.orm.public.Comment.create({
    id: crypto.randomUUID(),
    threadId,
    userId: session.user.id,
    body: text.slice(0, 2000),
  });
  revalidatePath(`/documents/${(thread as { documentId: string }).documentId}`);
}

export async function setThreadResolved(threadId: string, resolved: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const thread = await db.orm.public.CommentThread.first({ id: threadId });
  if (!thread) throw new Error('评论不存在');
  await assertDocumentAccess((thread as { documentId: string }).documentId, session.user.id, 'commenter');

  await db.orm.public.CommentThread.where({ id: threadId }).update({ resolved });
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const comment = await db.orm.public.Comment.first({ id: commentId });
  if (!comment || (comment as { userId: string }).userId !== session.user.id) {
    throw new Error('未授权');
  }

  await db.orm.public.Comment.where({ id: commentId }).delete();
}
