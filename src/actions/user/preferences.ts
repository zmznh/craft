'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

const themeValues = new Set(['light', 'dark', 'system']);
const fontValues = new Set(['inter', 'serif', 'mono', 'rounded']);
const widthValues = new Set(['narrow', 'default', 'wide']);

function validate(kind: string, value: string): string {
  const allowed = kind === 'theme'
    ? themeValues
    : kind === 'editorFont'
      ? fontValues
      : widthValues;
  if (!allowed.has(value)) throw new Error('无效的偏好值');
  return value;
}

export async function getPreferences() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const user = await db.orm.public.User.first({ id: session.user.id });
  if (!user) throw new Error('用户不存在');

  const row = user as { theme: string; editorFont: string; editorWidth: string };
  return {
    theme: row.theme,
    editorFont: row.editorFont,
    editorWidth: row.editorWidth,
  };
}

export async function updatePreferences(data: {
  theme?: string;
  editorFont?: string;
  editorWidth?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const update: Record<string, string> = {};
  if (data.theme !== undefined) update.theme = validate('theme', data.theme);
  if (data.editorFont !== undefined) update.editorFont = validate('editorFont', data.editorFont);
  if (data.editorWidth !== undefined) update.editorWidth = validate('editorWidth', data.editorWidth);

  await db.orm.public.User.where({ id: session.user.id }).update(update);
}
