'use server';

import { auth } from '@/lib/auth/auth';
import { getDb } from '@/prisma/db';
import { revalidatePath } from 'next/cache';

export async function addProperty(data: {
  collectionId: string;
  name: string;
  type: string;
  config?: any;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const collection = await db.orm.public.Collection.first({ id: data.collectionId });
  if (!collection || (collection as any).userId !== session.user.id) {
    throw new Error('集合不存在');
  }

  const properties = await db.orm.public.CollectionProperty
    .where({ collectionId: data.collectionId })
    .all();

  await db.orm.public.CollectionProperty.create({
    id: crypto.randomUUID(),
    collectionId: data.collectionId,
    name: data.name,
    type: data.type,
    config: data.config ? JSON.stringify(data.config) : null,
    order: properties.length,
    isVisible: true,
  });

  revalidatePath(`/collections/${data.collectionId}`);
}

export async function updateProperty(
  propertyId: string,
  data: { name?: string; config?: any; isVisible?: boolean; width?: number }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const property = await db.orm.public.CollectionProperty.first({ id: propertyId });
  if (!property) return;
  const collection = await db.orm.public.Collection.first({ id: (property as any).collectionId });
  if (!collection || (collection as any).userId !== session.user.id) {
    throw new Error('集合不存在');
  }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.config !== undefined) updateData.config = JSON.stringify(data.config);
  if (data.isVisible !== undefined) updateData.isVisible = data.isVisible;
  if (data.width !== undefined) updateData.width = data.width;

  await db.orm.public.CollectionProperty.where({ id: propertyId }).update(updateData);

  revalidatePath(`/collections/${(property as any).collectionId}`);
}

export async function deleteProperty(propertyId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const property = await db.orm.public.CollectionProperty.first({ id: propertyId });
  if (!property) return;
  const collection = await db.orm.public.Collection.first({ id: (property as any).collectionId });
  if (!collection || (collection as any).userId !== session.user.id) {
    throw new Error('集合不存在');
  }

  await db.orm.public.CollectionValue.where({ propertyId }).delete();
  await db.orm.public.CollectionProperty.where({ id: propertyId }).delete();

  revalidatePath(`/collections/${(property as any).collectionId}`);
}

export async function reorderProperties(
  collectionId: string,
  propertyIds: string[]
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授权');

  const db = await getDb();
  const collection = await db.orm.public.Collection.first({ id: collectionId });
  if (!collection || (collection as any).userId !== session.user.id) {
    throw new Error('集合不存在');
  }

  const properties = await db.orm.public.CollectionProperty.where({ collectionId }).all();
  const allowedIds = new Set(properties.map((property: any) => property.id));
  if (propertyIds.some((propertyId) => !allowedIds.has(propertyId))) {
    throw new Error('属性不属于该集合');
  }

  for (let i = 0; i < propertyIds.length; i++) {
    await db.orm.public.CollectionProperty
      .where({ id: propertyIds[i] })
      .update({ order: i });
  }

  revalidatePath(`/collections/${collectionId}`);
}
