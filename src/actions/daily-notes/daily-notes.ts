'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';
import { dailyNoteTitle } from '@/lib/utils/daily-note';

export interface DailyNoteItem {
  id: string;
  title: string;
  icon: string | null;
  plainText: string;
  dailyNoteDate: string;
  updatedAt: string;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getDailyNotes(): Promise<DailyNoteItem[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const notes = await db.orm.public.Document
    .where({ userId: session.user.id, isDeleted: false, isDailyNote: true })
    .orderBy((d: any) => d.dailyNoteDate.desc())
    .limit(120)
    .all();

  return notes.map((n: any) => ({
    id: n.id,
    title: n.title,
    icon: n.icon,
    plainText: n.plainText ?? '',
    dailyNoteDate: n.dailyNoteDate,
    updatedAt: n.updatedAt,
  }));
}

export async function getOrCreateTodayNote() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');
  const uid = session.user.id;

  const db = await getDb();
  const now = new Date();
  const start = startOfDay(now).toISOString();
  const end = endOfDay(now).toISOString();

  const existing = await db.orm.public.Document
    .where({ userId: uid, isDeleted: false, isDailyNote: true })
    .where((d: any) => d.dailyNoteDate.gte(start))
    .where((d: any) => d.dailyNoteDate.lte(end))
    .limit(1)
    .all();

  if (existing.length > 0) {
    const n = existing[0] as any;
    return { id: n.id, created: false };
  }

  const config = await db.orm.public.DailyNotesConfig.first({ userId: uid });
  const folderId = config ? (config as any).folderId : null;

  const doc = await db.orm.public.Document.create({
    id: crypto.randomUUID(),
    title: dailyNoteTitle(now),
    icon: '📅',
    userId: uid,
    folderId,
    isDailyNote: true,
    dailyNoteDate: start,
  });

  return { id: (doc as any).id as string, created: true };
}
