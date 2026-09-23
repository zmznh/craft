import { compare, hash } from 'bcryptjs';
import { getDb } from '@/prisma/db';

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export async function findUserByEmail(email: string) {
  const db = await getDb();
  return db.orm.public.User.first({ email });
}

export async function findUserById(id: string) {
  const db = await getDb();
  return db.orm.public.User.first({ id });
}

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await hashPassword(password);
  const db = await getDb();
  return db.orm.public.User.create({
    id: crypto.randomUUID(),
    email,
    password: hashedPassword,
    name: name ?? null,
  });
}
