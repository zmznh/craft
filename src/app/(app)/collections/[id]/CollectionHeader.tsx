'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <div className="border-b border-border bg-background px-8 py-4">
      <div className="mb-4 flex items-center gap-3">
        {collection.icon && (
          <span className="text-3xl leading-none">{collection.icon}</span>
        )}
        <h1 className="text-title font-semibold">{collection.name}</h1>
      </div>

      <div className="flex items-center justify-between">
        <Tabs value={activeView?.id} onValueChange={handleViewChange}>
          <TabsList className="gap-1 bg-transparent p-0">
            {collection.views.map((view: { id: string; name: string }) => (
              <TabsTrigger
                key={view.id}
                value={view.id}
                className="h-8 rounded-md px-3 text-ui font-medium text-foreground/55 transition-colors duration-150 hover:bg-foreground/4 hover:text-foreground data-active:bg-foreground/4 data-active:text-foreground data-active:shadow-none"
              >
                {view.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
