'use server';

import { auth } from '@/lib/auth/auth';
import { requireUserId } from '@/lib/authz/guard';
import { requireDocumentAccess } from '@/lib/authz/document-access';
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
  const userId = await requireUserId();
  const access = await requireDocumentAccess(documentId, userId, 'viewer');
  const document = access.document;

  const doc = document as { title: string; content: unknown };
  const body = serializeDocument(doc.content ?? { type: 'doc', content: [] }, format);

  return {
    filename: `${doc.title || '无标题'}.${extensionByFormat[format]}`,
    mime: mimeByFormat[format],
    body,
  };
}
