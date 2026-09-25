'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CellDisplay } from '@/components/collection/PropertyCell';
import { applyFilters } from '@/components/collection/FilterBar';
import { applySorts } from '@/components/collection/SortMenu';
import { addItem, deleteItem } from '@/actions/collection/items';
import type { getCollection } from '@/actions/collection/collection';

type Collection = Awaited<ReturnType<typeof getCollection>>;
type View = NonNullable<Collection>['views'][number];

function parseConfig(raw: unknown): any {
  if (!raw) return {};
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function parseValue(raw: unknown): any {
  if (raw == null || raw === '') return null;
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/** Craft's gallery shows one card per row, using the first image-ish value as the cover. */
export function GalleryView({ collection, view }: { collection: NonNullable<Collection>; view: View }) {
  const router = useRouter();
  const config = parseConfig((view as any).config);
  const [filters, setFilters] = useState<any[]>(config.filters ?? []);
  const [sorts, setSorts] = useState<any[]>(config.sorts ?? []);

  useEffect(() => {
    const next = parseConfig((view as any).config);
    setFilters(next.filters ?? []);
    setSorts(next.sorts ?? []);
  }, [view]);

  const properties = (collection.properties as any[])
    .filter((property) => property.isVisible && property.type !== 'created_at' && property.type !== 'updated_at')
    .sort((a, b) => a.order - b.order);

  const items = applySorts(applyFilters(collection.items as any[], filters, collection.properties), sorts, collection.properties);

  const valueOf = (item: any, propertyId: string | undefined) =>
    item.values?.find((entry: any) => entry.propertyId === propertyId)?.value ?? null;

  const coverOf = (item: any): string | null => {
    for (const property of properties) {
      const value = parseValue(valueOf(item, property.id));
      if (property.type === 'file' && typeof value?.url === 'string') return value.url;
      if (typeof value === 'string' && /^(https?:\/\/\S+\.(png|jpe?g|gif|webp|avif)|data:image\/)/i.test(value)) return value;
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item: any) => {
          const [primary, ...rest] = properties;
          const cover = coverOf(item);
          return (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
            >
              <div className="flex h-32 items-center justify-center bg-muted/40">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" className="size-full object-cover" />
                ) : (
                  <span className="text-2xl text-muted-foreground/40">·</span>
                )}
              </div>
              <div className="flex flex-col gap-1 p-3">
                <p className="truncate text-sm font-medium">
                  {String(parseValue(valueOf(item, primary?.id)) ?? '') || '未命名'}
                </p>
                {rest.slice(0, 3).map((property: any) => (
                  <p
                    key={property.id}
                    className="flex items-center gap-1.5 truncate text-xs text-muted-foreground"
                  >
                    <span className="shrink-0 opacity-70">{property.name}</span>
                    <CellDisplay value={valueOf(item, property.id)} />
                  </p>
                ))}
              </div>
              <div className="mt-auto flex items-center gap-1 px-2 pb-2 opacity-0 transition-opacity group-hover:opacity-100">
                {item.documentId && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="打开条目"
                    onClick={() => router.push(`/documents/${item.documentId}`)}
                  >
                    <Link2 className="size-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="删除条目"
                  onClick={async () => {
                    await deleteItem(item.id);
                    router.refresh();
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          );
        })}

        <button
          onClick={async () => {
            await addItem(collection.id);
            router.refresh();
          }}
          className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          新建条目
        </button>
      </div>
    </div>
  );
}
