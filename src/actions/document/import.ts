'use server';

import { assertOwned, requireUserId } from '@/lib/authz/guard';
import { getDb } from '@/prisma/db';
import { parseMarkdown, titleFromMarkdown } from '@/lib/import/markdown';
import { serializeDocument } from '@/lib/document-codec';

const MAX_FILES = 20;
const MAX_CHARS = 500_000;
const IMPORT_FOLDER = 'Imported Notes';

export interface MarkdownFile {
  name: string;
  text: string;
}

export interface ImportedDocument {
  id: string;
  title: string;
}

/**
 * Brings Markdown files (or a Text Bundle's `text.md`) in as real documents.
 * Without a folder chosen they land in a single "Imported Notes" folder, which
 * keeps a bulk import from scattering across the sidebar.
 */
export async function importMarkdownDocuments(input: {
  files: MarkdownFile[];
  folderId?: string | null;
}): Promise<ImportedDocument[]> {
  const userId = await requireUserId();
  const files = input.files.filter((file) => file.text.trim()).slice(0, MAX_FILES);
  if (!files.length) throw new Error('没有可导入的内容');
  if (files.some((file) => file.text.length > MAX_CHARS)) throw new Error('单个文件过大');

  const db = await getDb();
  let folderId = input.folderId ?? null;
  if (folderId) {
    await assertOwned('Folder', folderId, userId, '目标文件夹不存在');
  } else {
    const folders = await db.orm.public.Folder.where({ userId }).all();
    const existing = folders.find((folder: any) => folder.name === IMPORT_FOLDER && !folder.isDeleted);
    folderId = existing
      ? (existing as any).id
      : (
          await db.orm.public.Folder.create({
            id: crypto.randomUUID(),
            name: IMPORT_FOLDER,
            icon: '📥',
            userId,
          })
        ).id;
  }

  const created: ImportedDocument[] = [];
  for (const file of files) {
    const content = parseMarkdown(file.text);
    const title = file.name.replace(/\.(markdown|md|txt)$/i, '').trim() || titleFromMarkdown(file.text);
    const document = await db.orm.public.Document.create({
      id: crypto.randomUUID(),
      title: title.slice(0, 80),
      userId,
      folderId,
      content,
      plainText: serializeDocument(content, 'text'),
    });
    created.push({ id: (document as any).id, title: (document as any).title });
  }

  return created;
}
