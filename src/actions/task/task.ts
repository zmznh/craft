'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

function updateTaskNode(content: unknown, blockId: string, isCompleted: boolean): unknown {
  const next = JSON.parse(JSON.stringify(content));
  let updated = false;
  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'taskItem' && node.attrs?.taskId === blockId) {
      node.attrs = { ...node.attrs, checked: isCompleted };
      updated = true;
      return;
    }
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(next);
  return updated ? next : content;
}

async function syncTaskToDocument(db: any, task: any, isCompleted: boolean) {
  if (!task.documentId || !task.blockId) return;
  const document = await db.orm.public.Document.first({ id: task.documentId });
  if (!document || !(document as any).content) return;
  const content = updateTaskNode((document as any).content, task.blockId, isCompleted);
  if (content !== (document as any).content) {
    await db.orm.public.Document.where({ id: task.documentId }).update({ content });
  }
}

export interface TaskItem {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
  documentId: string | null;
  documentTitle?: string | null;
}

export async function syncDocumentTasks(
  documentId: string,
  tasks: { taskId: string; title: string; isCompleted: boolean }[]
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const source = await db.orm.public.Document.first({ id: documentId });
  if (!source || (source as any).userId !== session.user.id) throw new Error('未授权');

  const existing = await db.orm.public.Task
    .where({ documentId, userId: session.user.id })
    .all();

  const incoming = new Map(tasks.map((task) => [task.taskId, task]));
  const existingByBlockId = new Map(
    existing
      .filter((task: any) => typeof task.blockId === 'string' && task.blockId)
      .map((task: any) => [task.blockId, task]),
  );

  for (const [taskId, task] of incoming) {
    const match = existingByBlockId.get(taskId);
    if (match) {
      if (
        (match as any).title !== task.title ||
        (match as any).isCompleted !== task.isCompleted
      ) {
        await db.orm.public.Task.where({ id: (match as any).id }).update({
          title: task.title,
          isCompleted: task.isCompleted,
          status: task.isCompleted ? 'done' : 'todo',
        });
      }
    } else {
      await db.orm.public.Task.create({
        id: crypto.randomUUID(),
        userId: session.user.id,
        documentId,
        blockId: taskId,
        title: task.title,
        isCompleted: task.isCompleted,
        status: task.isCompleted ? 'done' : 'todo',
      });
    }
  }

  for (const t of existing) {
    const row = t as any;
    if (typeof row.blockId === 'string' && !incoming.has(row.blockId)) {
      await db.orm.public.Task.where({ id: row.id }).delete();
    }
  }
}

export async function getTasks(): Promise<TaskItem[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const tasks = await db.orm.public.Task
    .where({ userId: session.user.id })
    .orderBy((t: any) => t.createdAt.desc())
    .limit(200)
    .all();

  const items: TaskItem[] = [];
  for (const t of tasks) {
    const row = t as any;
    let documentTitle: string | null = null;
    if (row.documentId) {
      const doc = await db.orm.public.Document.first({ id: row.documentId });
      if (doc && !(doc as any).isDeleted) documentTitle = (doc as any).title;
      else documentTitle = null;
    }
    items.push({
      id: row.id,
      title: row.title,
      isCompleted: row.isCompleted,
      dueDate: row.dueDate,
      documentId: row.documentId,
      documentTitle,
    });
  }
  items.sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1));
  return items;
}

export async function createTask(title: string, dueDate?: string | null) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');
  if (!title.trim()) throw new Error('标题不能为空');

  const db = await getDb();
  const task = await db.orm.public.Task.create({
    id: crypto.randomUUID(),
    userId: session.user.id,
    title: title.trim(),
    dueDate: dueDate ?? null,
  });
  return task;
}

export async function toggleTask(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const task = await db.orm.public.Task.first({ id });
  if (!task || (task as any).userId !== session.user.id) throw new Error('未授权');

  const next = !(task as any).isCompleted;
  await db.orm.public.Task.where({ id }).update({
    isCompleted: next,
    status: next ? 'done' : 'todo',
  });
  await syncTaskToDocument(db, task, next);
  return next;
}

export async function updateTaskDueDate(id: string, dueDate: string | null) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const task = await db.orm.public.Task.first({ id });
  if (!task || (task as any).userId !== session.user.id) throw new Error('未授权');

  await db.orm.public.Task.where({ id }).update({ dueDate });
}

export async function deleteTask(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const task = await db.orm.public.Task.first({ id });
  if (!task || (task as any).userId !== session.user.id) throw new Error('未授权');

  await db.orm.public.Task.where({ id }).delete();
}

export async function getTasksForDay(dayStart: string, dayEnd: string): Promise<TaskItem[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const tasks = await db.orm.public.Task
    .where({ userId: session.user.id })
    .where((t: any) => t.dueDate.gte(dayStart))
    .where((t: any) => t.dueDate.lte(dayEnd))
    .all();

  return tasks.map((t: any) => ({
    id: t.id,
    title: t.title,
    isCompleted: t.isCompleted,
    dueDate: t.dueDate,
    documentId: t.documentId,
  }));
}
