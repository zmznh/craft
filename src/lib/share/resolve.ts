import { getDb } from '@/prisma/db';

/**
 * A published page is addressed either by its human slug or by the share token,
 * so both lookups live in one place. Not a server action: callers may need the
 * passcode itself, which must never travel to the client.
 */
export async function findShare(identifier: string): Promise<Record<string, unknown> | null> {
  const db = await getDb();
  const bySlug = await db.orm.public.DocumentShare.first({ slug: identifier });
  if (bySlug) return bySlug;
  return (await db.orm.public.DocumentShare.first({ token: identifier })) ?? null;
}
