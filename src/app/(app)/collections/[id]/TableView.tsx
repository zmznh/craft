'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/lib/use-is-mobile';
import { addItem, deleteItem, setItemValue } from '@/actions/collection/items';
import { updateView } from '@/actions/collection/views';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PropertyCell } from '@/components/collection/PropertyCell';
import { FilterBar, applyFilters } from '@/components/collection/FilterBar';
import { SortMenu, applySorts } from '@/components/collection/SortMenu';
import { GroupMenu, applyGrouping } from '@/components/collection/GroupMenu';
import type { getCollection } from '@/actions/collection/collection';

type Collection = Awaited<ReturnType<typeof getCollection>>;
type View = NonNullable<Collection>['views'][number];

interface TableViewProps {
  collection: NonNullable<Collection>;
  view: View;
}

export function TableView({ collection, view }: TableViewProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [toolsOpen, setToolsOpen] = useState(false);
  const initialConfig = parseConfig((view as any).config);
  const [filters, setFilters] = useState<any[]>(initialConfig.filters ?? []);
  const [sorts, setSorts] = useState<any[]>(initialConfig.sorts ?? []);
  const [groupBy, setGroupBy] = useState<string | null>(initialConfig.groupBy ?? null);

  useEffect(() => {
    const config = parseConfig((view as any).config);
    setFilters(config.filters ?? []);
    setSorts(config.sorts ?? []);
    setGroupBy(config.groupBy ?? null);
  }, [view]);

  const persistConfig = async (next: { filters: any[]; sorts: any[]; groupBy: string | null }) => {
    await updateView(view.id, { config: next });
  };

  const visibleProperties = collection.properties
    .filter((p: any) => p.isVisible)
    .sort((a: any, b: any) => a.order - b.order);

  // Apply filters, sorts, and grouping
  let processedItems = collection.items;
  processedItems = applyFilters(processedItems, filters, collection.properties);
  processedItems = applySorts(processedItems, sorts, collection.properties);
  const groupedItems = applyGrouping(processedItems, groupBy, collection.properties);

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
    return v?.value ?? null;
  };

  const tools = (
    <>
      <FilterBar
        collection={collection}
        filters={filters}
        onFiltersChange={(next) => {
          setFilters(next);
          void persistConfig({ filters: next, sorts, groupBy });
        }}
      />
      <SortMenu
        collection={collection}
        sorts={sorts}
        onSortsChange={(next) => {
          setSorts(next);
          void persistConfig({ filters, sorts: next, groupBy });
        }}
      />
      <GroupMenu
        collection={collection}
        groupBy={groupBy}
        onGroupByChange={(next) => {
          setGroupBy(next);
          void persistConfig({ filters, sorts, groupBy: next });
        }}
      />
    </>
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-[var(--editor-pad-x)] py-2">
        {isMobile ? (
          <>
            {/* Phones keep two icons only: the view tools move into a bottom sheet. */}
            <Button variant="ghost" size="sm" onClick={() => setToolsOpen(true)} aria-label="视图工具">
              <SlidersHorizontal className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleAddItem} aria-label="新增条目">
              <Plus className="size-4" />
            </Button>
            <Sheet open={toolsOpen} onOpenChange={setToolsOpen}>
              <SheetContent side="bottom" className="max-h-[70dvh] gap-0 p-0">
                <SheetTitle className="sr-only">视图工具</SheetTitle>
                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">{tools}</div>
              </SheetContent>
            </Sheet>
          </>
        ) : (
          tools
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {groupBy ? (
          <div className="space-y-4 p-4">
            {Array.from(groupedItems.entries()).map(([groupKey, items]) => {
              const property = collection.properties.find((p: any) => p.id === groupBy);
              let groupLabel = groupKey;

              if (property?.type === 'select') {
                const config = parseConfig(property.config);
                const option = config.options?.find((o: any) => o.id === groupKey);
                groupLabel = option?.label ?? (groupKey === '__ungrouped__' ? '未分组' : groupKey);
              } else if (property?.type === 'checkbox') {
                groupLabel = groupKey === 'true' ? '是' : '否';
              }

              return (
                <div key={groupKey}>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                    {groupLabel} ({items.length})
                  </h3>
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10 bg-muted/50 max-md:bg-muted">
                      <tr>
                        {visibleProperties.map((property: any) => (
                          <th
                            key={property.id}
                            className="border-b border-r border-border px-3 py-2 text-left text-sm font-medium text-muted-foreground first:border-l first:max-md:sticky first:max-md:left-0 first:max-md:z-20 first:max-md:bg-muted"
                          >
                            {property.name}
                          </th>
                        ))}
                        <th className="border-b border-border px-2 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any) => (
                        <tr key={item.id} className="group hover:bg-muted/30">
                          {visibleProperties.map((property: any) => (
                            <td
                              key={property.id}
                              className="border-b border-r border-border px-0 py-0 first:border-l first:max-md:sticky first:max-md:left-0 first:max-md:bg-background"
                            >
                              <PropertyCell
                                property={property}
                                value={getCellValue(item, property.id)}
                                onChange={(value) => handleSetValue(item.id, property.id, value)}
                                item={item}
                                properties={collection.properties as any}
                              />
                            </td>
                          ))}
                          <td className="border-b border-border px-1 py-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="size-4 text-muted-foreground" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-muted/50 max-md:bg-muted">
              <tr>
                {visibleProperties.map((property: any) => (
                  <th
                    key={property.id}
                    className="border-b border-r border-border px-3 py-2 text-left text-sm font-medium text-muted-foreground first:border-l first:max-md:sticky first:max-md:left-0 first:max-md:z-20 first:max-md:bg-muted"
                  >
                    {property.name}
                  </th>
                ))}
                <th className="border-b border-border px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {processedItems.map((item: any) => (
                <tr key={item.id} className="group hover:bg-muted/30">
                  {visibleProperties.map((property: any) => (
                    <td
                      key={property.id}
                      className="border-b border-r border-border px-0 py-0 first:border-l first:max-md:sticky first:max-md:left-0 first:max-md:bg-background"
                    >
                      <PropertyCell
                        property={property}
                        value={getCellValue(item, property.id)}
                        onChange={(value) => handleSetValue(item.id, property.id, value)}
                        item={item}
                        properties={collection.properties as any}
                      />
                    </td>
                  ))}
                  <td className="border-b border-border px-1 py-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="border-t border-border p-2">
        <Button variant="ghost" size="sm" onClick={handleAddItem}>
          <Plus className="mr-2 size-4" />
          新建
        </Button>
      </div>
    </div>
  );
}

function parseConfig(config: string | null): any {
  if (!config) return {};
  try {
    return typeof config === 'string' ? JSON.parse(config) : config;
  } catch {
    return {};
  }
}
