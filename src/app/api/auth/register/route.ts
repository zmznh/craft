import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { getDb } from '@/prisma/db';

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码为必填项' }, { status: 400 });
    }

    const existing = await db.orm.public.User.first({ email });
    if (existing) {
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);
    await db.orm.public.User.create({
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      name: name ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Register error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `注册失败: ${message}` }, { status: 500 });
  }
}
