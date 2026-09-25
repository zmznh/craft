import { getCollection } from '@/actions/collection/collection';
import { notFound } from 'next/navigation';
import { ViewTransition } from 'react';
import { CollectionHeader } from './CollectionHeader';
import { CollectionView } from './CollectionView';

interface CollectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params;
  const collection = await getCollection(id);

  if (!collection) {
    notFound();
  }

  const activeView = collection.views.find((v: { isActive: boolean }) => v.isActive) || collection.views[0];

  return (
    <ViewTransition>
    <div className="flex flex-1 flex-col overflow-hidden">
      <CollectionHeader collection={collection} />
      <CollectionView
        collection={collection}
        activeView={activeView}
      />
    </div>
    </ViewTransition>
  );
}
