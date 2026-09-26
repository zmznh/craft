'use server';

import { auth, signOut } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const user = await db.orm.public.User.first({ id: session.user.id });
  if (!user) throw new Error('用户不存在');

  const row = user as { name: string | null; email: string };
  return { name: row.name ?? '', email: row.email };
}

export async function logout() {
  await signOut({ redirectTo: '/login' });
}
