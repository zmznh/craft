'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddViewMenu } from '@/components/collection/AddViewMenu';
import { AddPropertyMenu } from '@/components/collection/AddPropertyMenu';
import { setActiveView } from '@/actions/collection/views';
import { useRouter } from 'next/navigation';
import type { getCollection } from '@/actions/collection/collection';

type Collection = Awaited<ReturnType<typeof getCollection>>;

interface CollectionHeaderProps {
  collection: NonNullable<Collection>;
}

export function CollectionHeader({ collection }: CollectionHeaderProps) {
  const router = useRouter();
  const activeView = collection.views.find((v: { isActive: boolean }) => v.isActive) || collection.views[0];

  const handleViewChange = async (viewId: string) => {
    await setActiveView(collection.id, viewId);
    router.refresh();
  };

  return (
    <div className="border-b border-border bg-background px-[var(--editor-pad-x)] py-4">
      <div className="mb-4 flex items-center gap-3">
        {collection.icon && (
          <span className="text-3xl">{collection.icon}</span>
        )}
        <h1 className="min-w-0 truncate text-2xl font-semibold">{collection.name}</h1>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Tabs value={activeView?.id} onValueChange={handleViewChange} className="min-w-0">
          <TabsList className="max-w-full overflow-x-auto">
            {collection.views.map((view: { id: string; name: string }) => (
              <TabsTrigger key={view.id} value={view.id}>
                {view.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex shrink-0 items-center gap-1">
          <AddPropertyMenu collectionId={collection.id} />
          <AddViewMenu collectionId={collection.id} />
        </div>
      </div>
    </div>
  );
}
