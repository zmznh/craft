'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PropertyCell } from '@/components/collection/PropertyCell';
import { addItem, setItemValue } from '@/actions/collection/items';
import type { getCollection } from '@/actions/collection/collection';

type Collection = Awaited<ReturnType<typeof getCollection>>;
type View = NonNullable<Collection>['views'][number];

const READ_ONLY = new Set(['formula', 'created_at', 'updated_at']);

/** Form view is the data-entry counterpart of the table: one field per property. */
export function FormView({ collection, view }: { collection: NonNullable<Collection>; view: View }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const properties = (collection.properties as any[])
    .filter((property) => property.isVisible)
    .sort((a, b) => a.order - b.order);

  const submit = async () => {
    setSaving(true);
    try {
      const item = await addItem(collection.id);
      for (const property of properties) {
        const value = draft[property.id];
        if (value === undefined || value === null || value === '') continue;
        if (READ_ONLY.has(property.type)) continue;
        await setItemValue(item.id, property.id, value);
      }
      setDraft({});
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <form
        className="mx-auto flex max-w-xl flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <h2 className="text-lg font-semibold">{collection.name} · 新建条目</h2>
        {properties.map((property) => (
          <label key={property.id} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">{property.name}</span>
            <div className="rounded-md border border-border">
              <PropertyCell
                property={property}
                value={draft[property.id] ?? null}
                onChange={(value) => setDraft((current) => ({ ...current, [property.id]: value }))}
                properties={properties}
              />
            </div>
          </label>
        ))}
        <Button type="submit" disabled={saving} className="self-start">
          {saving ? '保存中…' : '添加条目'}
        </Button>
      </form>
    </div>
  );
}
