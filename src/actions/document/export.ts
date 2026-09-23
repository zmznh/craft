'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';
import { serializeDocument } from '@/lib/document-codec';

export type ExportFormat = 'markdown' | 'html' | 'text' | 'json';

const mimeByFormat: Record<ExportFormat, string> = {
  markdown: 'text/markdown;charset=utf-8',
  html: 'text/html;charset=utf-8',
  text: 'text/plain;charset=utf-8',
  json: 'application/json;charset=utf-8',
};

const extensionByFormat: Record<ExportFormat, string> = {
  markdown: 'md',
  html: 'html',
  text: 'txt',
  json: 'json',
};

export async function exportDocument(documentId: string, format: ExportFormat) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const document = await db.orm.public.Document.first({ id: documentId });
  if (!document || (document as { userId: string }).userId !== session.user.id) {
    throw new Error('文档不存在');
  }

  const doc = document as { title: string; content: unknown };
  const body = serializeDocument(doc.content ?? { type: 'doc', content: [] }, format);

  return {
    filename: `${doc.title || '无标题'}.${extensionByFormat[format]}`,
    mime: mimeByFormat[format],
    body,
  };
}
