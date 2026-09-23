import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const NAME_RE = /^[A-Za-z0-9._-]+$/;

const EXT_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.json': 'application/json',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export function mimeForName(name: string): string {
  return EXT_MIME[path.extname(name).toLowerCase()] ?? 'application/octet-stream';
}

function safeStoredName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  if (!/^\.[A-Za-z0-9]{1,10}$/.test(ext)) return randomUUID();
  return randomUUID() + ext;
}

export function resolveUploadPath(name: string): string {
  const base = path.basename(name);
  if (!NAME_RE.test(base)) throw new Error('非法文件名');
  return path.join(UPLOAD_DIR, base);
}

export async function saveUpload(
  file: File
): Promise<{ name: string; size: number; type: string }> {
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = safeStoredName(file.name || '');
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(resolveUploadPath(name), buf);
  return { name, size: buf.byteLength, type: file.type || mimeForName(name) };
}

export async function saveUploadBuffer(
  buf: Buffer,
  ext: string
): Promise<{ name: string; size: number }> {
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = randomUUID() + ext;
  await writeFile(resolveUploadPath(name), buf);
  return { name, size: buf.byteLength };
}

export async function readUpload(name: string): Promise<Buffer> {
  return readFile(resolveUploadPath(name));
}

export async function deleteUpload(name: string): Promise<void> {
  await unlink(resolveUploadPath(name)).catch(() => {});
}
