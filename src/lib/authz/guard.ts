import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';

export class AuthorizationError extends Error {
  constructor(message = '未授权') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export interface SortableField {
  asc(): unknown;
  desc(): unknown;
}

export type SortableModel = Record<string, SortableField>;

export interface ModelQuery {
  orderBy(fn: (model: SortableModel) => unknown): ModelQuery;
  all(): Promise<Record<string, unknown>[]>;
  update(data: Record<string, unknown>): Promise<unknown>;
  delete(): Promise<unknown>;
}

export interface ModelTable {
  first(where?: Record<string, unknown>): Promise<Record<string, unknown> | null>;
  create(data: Record<string, unknown>): Promise<Record<string, unknown>>;
  where(filter: Record<string, unknown>): ModelQuery;
}

export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new AuthorizationError();
  return userId;
}

export async function getTable(model: string): Promise<ModelTable> {
  const db = await getDb();
  return db.orm.public[model] as ModelTable;
}

/** Loads a row and proves it belongs to `userId` before the caller mutates it. */
export async function assertOwned<T = Record<string, unknown>>(
  model: string,
  id: string,
  userId: string,
  message = '未授权',
): Promise<T> {
  const row = await (await getTable(model)).first({ id });
  if (!row || row.userId !== userId) throw new AuthorizationError(message);
  return row as T;
}
