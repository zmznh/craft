'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export async function saveAsTemplate(documentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const doc = await db.orm.public.Document.first({ id: documentId });
  if (!doc || (doc as any).userId !== session.user.id) throw new Error('未授权');
  const d = doc as any;

  const copy = await db.orm.public.Document.create({
    id: crypto.randomUUID(),
    title: `${d.title || '无标题'} 模板`,
    icon: d.icon,
    content: d.content,
    plainText: d.plainText,
    pageStyle: d.pageStyle,
    font: d.font,
    width: d.width,
    userId: session.user.id,
    isTemplate: true,
  });

  return copy;
}
