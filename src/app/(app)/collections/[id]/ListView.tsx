'use client';

import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { addItem, deleteItem, setItemValue } from '@/actions/collection/items';
import { useRouter } from 'next/navigation';
import { PropertyCell } from '@/components/collection/PropertyCell';
import type { getCollection } from '@/actions/collection/collection';

type Collection = Awaited<ReturnType<typeof getCollection>>;
type View = NonNullable<Collection>['views'][number];

interface ListViewProps {
  collection: NonNullable<Collection>;
  view: View;
}

export function ListView({ collection }: ListViewProps) {
  const router = useRouter();

  const visibleProperties = collection.properties
    .filter((p: any) => p.isVisible)
    .sort((a: any, b: any) => a.order - b.order);

  const handleSetValue = async (itemId: string, propertyId: string, value: any) => {
    await setItemValue(itemId, propertyId, value);
    router.refresh();
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteItem(itemId);
    router.refresh();
  };

  const handleAddItem = async () => {
    await addItem(collection.id);
    router.refresh();
  };

  const getCellValue = (item: any, propertyId: string) => {
    const v = item.values?.find((val: any) => val.propertyId === propertyId);
    return v?.value ?? '';
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="mx-auto max-w-3xl space-y-2">
        {collection.items.map((item: any) => (
          <div
            key={item.id}
            className="group rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                {visibleProperties.map((property: any) => {
                  const value = getCellValue(item, property.id);

                  return (
                    <div key={property.id} className="flex items-start gap-3">
                      <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                        {property.name}
                      </span>
                      <div className="flex-1">
                        <PropertyCell
                          property={property}
                          value={value}
                          onChange={(newValue) => handleSetValue(item.id, property.id, newValue)}
                          item={item}
                          properties={collection.properties as any}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 opacity-0 group-hover:opacity-100"
                onClick={() => handleDeleteItem(item.id)}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-4 max-w-3xl">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleAddItem}>
          <Plus className="mr-2 size-4" />
          新建
        </Button>
      </div>
    </div>
  );
}
