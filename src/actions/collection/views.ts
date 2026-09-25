'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';
import { revalidatePath } from 'next/cache';

export async function createView(
  collectionId: string,
  data: {
    name: string;
    type: 'table' | 'kanban' | 'calendar' | 'list' | 'gallery' | 'form';
    config?: any;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();

  const collection = await db.orm.public.Collection.first({ id: collectionId });
  if (!collection || (collection as any).userId !== session.user.id) {
    throw new Error('集合不存在');
  }

  const views = await db.orm.public.CollectionView.where({ collectionId }).all();
  const maxOrder = views.reduce((max: number, v: any) => Math.max(max, v.order ?? 0), -1);

  const viewId = crypto.randomUUID();
  await db.orm.public.CollectionView.create({
    id: viewId,
    collectionId,
    name: data.name,
    type: data.type,
    config: data.config ? JSON.stringify(data.config) : null,
    order: maxOrder + 1,
    isActive: false,
  });

  revalidatePath(`/collections/${collectionId}`);
  return { id: viewId, collectionId, name: data.name, type: data.type };
}

export async function updateView(
  viewId: string,
  data: {
    name?: string;
    config?: any;
    isActive?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const view = await db.orm.public.CollectionView.first({ id: viewId });
  if (!view) throw new Error('视图不存在');
  const collection = await db.orm.public.Collection.first({ id: (view as any).collectionId });
  if (!collection || (collection as any).userId !== session.user.id) {
    throw new Error('集合不存在');
  }

  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.config !== undefined) updateData.config = JSON.stringify(data.config);

  await db.orm.public.CollectionView.where({ id: viewId }).update(updateData);

  revalidatePath(`/collections/${(view as any).collectionId}`);
}

export async function deleteView(viewId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();

  const view = await db.orm.public.CollectionView.first({ id: viewId });
  if (!view) throw new Error('视图不存在');
  const collection = await db.orm.public.Collection.first({ id: (view as any).collectionId });
  if (!collection || (collection as any).userId !== session.user.id) {
    throw new Error('集合不存在');
  }

  await db.orm.public.CollectionView.where({ id: viewId }).delete();

  revalidatePath(`/collections/${(view as any).collectionId}`);
}

export async function setActiveView(
  collectionId: string,
  viewId: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();

  const collection = await db.orm.public.Collection.first({ id: collectionId });
  if (!collection || (collection as any).userId !== session.user.id) {
    throw new Error('集合不存在');
  }

  const views = await db.orm.public.CollectionView.where({ collectionId }).all();
  for (const v of views) {
    await db.orm.public.CollectionView.where({ id: (v as any).id }).update({
      isActive: (v as any).id === viewId,
    });
  }

  revalidatePath(`/collections/${collectionId}`);
}
