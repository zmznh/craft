'use client';

import { Button } from '@/components/ui/button';
import { ArrowUpDown, X, Plus } from 'lucide-react';
import { useState } from 'react';
import type { getCollection } from '@/actions/collection/collection';

type Collection = Awaited<ReturnType<typeof getCollection>>;

interface SortRule {
  id: string;
  propertyId: string;
  direction: 'asc' | 'desc';
}

interface SortMenuProps {
  collection: NonNullable<Collection>;
  sorts: SortRule[];
  onSortsChange: (sorts: SortRule[]) => void;
}

export function SortMenu({ collection, sorts, onSortsChange }: SortMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const properties = collection.properties.filter((p: any) => p.isVisible);

  const handleAddSort = () => {
    if (properties.length === 0) return;

    const newSort: SortRule = {
      id: crypto.randomUUID(),
      propertyId: properties[0].id,
      direction: 'asc',
    };

    onSortsChange([...sorts, newSort]);
  };

  const handleRemoveSort = (sortId: string) => {
    onSortsChange(sorts.filter(s => s.id !== sortId));
  };

  const handleUpdateSort = (sortId: string, updates: Partial<SortRule>) => {
    onSortsChange(
      sorts.map(s => (s.id === sortId ? { ...s, ...updates } : s))
    );
  };

  if (!isOpen) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        <ArrowUpDown className="mr-2 size-4" />
        排序
      </Button>
    );
  }

  return (
    <div className="space-y-2 border-b border-border bg-muted/30 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">排序规则</span>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {sorts.map(sort => (
          <div key={sort.id} className="flex items-center gap-2">
            <select
              value={sort.propertyId}
              onChange={(e) => handleUpdateSort(sort.id, { propertyId: e.target.value })}
              className="rounded border border-border bg-background px-2 py-1 text-sm"
            >
              {properties.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={sort.direction}
              onChange={(e) => handleUpdateSort(sort.id, { direction: e.target.value as 'asc' | 'desc' })}
              className="rounded border border-border bg-background px-2 py-1 text-sm"
            >
              <option value="asc">升序</option>
              <option value="desc">降序</option>
            </select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSort(sort.id)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="ghost" size="sm" onClick={handleAddSort}>
        <Plus className="mr-2 size-4" />
        添加排序
      </Button>
    </div>
  );
}

export function applySorts(items: any[], sorts: SortRule[], properties: any[]): any[] {
  if (sorts.length === 0) return items;

  return [...items].sort((a, b) => {
    for (const sort of sorts) {
      const property = properties.find((p: any) => p.id === sort.propertyId);
      if (!property) continue;

      const aValue = parseValue(a.values?.find((v: any) => v.propertyId === sort.propertyId)?.value);
      const bValue = parseValue(b.values?.find((v: any) => v.propertyId === sort.propertyId)?.value);

      let comparison = 0;

      if (property.type === 'number') {
        comparison = Number(aValue ?? 0) - Number(bValue ?? 0);
      } else if (property.type === 'date') {
        const aDate = aValue ? new Date(aValue).getTime() : 0;
        const bDate = bValue ? new Date(bValue).getTime() : 0;
        comparison = aDate - bDate;
      } else {
        comparison = String(aValue ?? '').localeCompare(String(bValue ?? ''));
      }

      if (comparison !== 0) {
        return sort.direction === 'asc' ? comparison : -comparison;
      }
    }

    return 0;
  });
}

function parseValue(raw: any): any {
  if (raw == null || raw === '') return null;
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
