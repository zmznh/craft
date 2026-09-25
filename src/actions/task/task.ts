'use server';

import { auth } from '@/lib/auth/auth';
import { requireUserId } from '@/lib/authz/guard';
import { requireDocumentAccess } from '@/lib/authz/document-access';
import { getDb } from '@/prisma/db';
import { nextOccurrence, parseRecurrence } from '@/lib/task/recurrence';

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
  remindAt: string | null;
  recurrence: string | null;
  recurrenceEnd: string | null;
  documentId: string | null;
  documentTitle?: string | null;
}

export async function syncDocumentTasks(
  documentId: string,
  tasks: { taskId: string; title: string; isCompleted: boolean }[]
) {
  const userId = await requireUserId();
  await requireDocumentAccess(documentId, userId, 'editor');

  const db = await getDb();
  const existing = await db.orm.public.Task
    .where({ documentId, userId })
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
        userId,
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
      remindAt: row.remindAt,
      recurrence: row.recurrence,
      recurrenceEnd: row.recurrenceEnd,
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

export async function toggleTask(id: string, timeZone?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const task = await db.orm.public.Task.first({ id });
  if (!task || (task as any).userId !== session.user.id) throw new Error('未授权');

  const next = !(task as any).isCompleted;
  await db.orm.public.Task.where({ id }).update({
    isCompleted: next,
    status: next ? 'done' : 'todo',
    completedAt: next ? new Date().toISOString() : null,
  });
  await syncTaskToDocument(db, task, next);

  if (next) await rollForward(db, task as any, timeZone);
  return next;
}

/**
 * A recurring task repeats by spawning the next occurrence rather than by
 * clearing itself, so the completed one stays as history.
 */
async function rollForward(db: any, task: any, timeZone?: string): Promise<void> {
  if (!parseRecurrence(task.recurrence)) return;

  const base = task.dueDate ?? task.remindAt;
  const from = base ? new Date(base) : new Date();
  const upcoming = nextOccurrence(task.recurrence, from, timeZone);
  if (!upcoming) return;

  let remindAt: string | null = null;
  if (task.remindAt) {
    const lead = base ? new Date(base).getTime() - new Date(task.remindAt).getTime() : 0;
    remindAt = new Date(upcoming.getTime() - lead).toISOString();
  }

  await db.orm.public.Task.create({
    id: crypto.randomUUID(),
    userId: task.userId,
    title: task.title,
    documentId: null,
    blockId: null,
    isCompleted: false,
    status: 'todo',
    dueDate: upcoming.toISOString(),
    remindAt,
    recurrence: task.recurrence,
    recurrenceEnd: task.recurrenceEnd,
    order: task.order,
  });
}

export interface TaskSchedule {
  dueDate: string | null;
  remindAt: string | null;
  recurrence: string | null;
  recurrenceEnd: string | null;
}

export async function setTaskSchedule(id: string, schedule: TaskSchedule) {
  const userId = await requireUserId();

  const db = await getDb();
  const task = await db.orm.public.Task.first({ id });
  if (!task || (task as any).userId !== userId) throw new Error('未授权');

  if (schedule.recurrence && !parseRecurrence(schedule.recurrence)) throw new Error('重复规则无法识别');

  await db.orm.public.Task.where({ id }).update({
    dueDate: schedule.dueDate,
    remindAt: schedule.remindAt,
    recurrence: schedule.recurrence,
    recurrenceEnd: schedule.recurrenceEnd,
  });
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
    remindAt: t.remindAt,
    recurrence: t.recurrence,
    recurrenceEnd: t.recurrenceEnd,
    documentId: t.documentId,
  }));
}
