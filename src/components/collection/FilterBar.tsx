'use client';

import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';
import type { getCollection } from '@/actions/collection/collection';

type Collection = Awaited<ReturnType<typeof getCollection>>;

interface Filter {
  id: string;
  propertyId: string;
  operator: string;
  value: any;
}

interface FilterBarProps {
  collection: NonNullable<Collection>;
  filters: Filter[];
  onFiltersChange: (filters: Filter[]) => void;
}

const operators = {
  text: [
    { value: 'contains', label: '包含' },
    { value: 'not_contains', label: '不包含' },
    { value: 'is', label: '等于' },
    { value: 'is_not', label: '不等于' },
    { value: 'is_empty', label: '为空' },
    { value: 'is_not_empty', label: '不为空' },
  ],
  number: [
    { value: 'eq', label: '等于' },
    { value: 'ne', label: '不等于' },
    { value: 'gt', label: '大于' },
    { value: 'lt', label: '小于' },
    { value: 'gte', label: '大于等于' },
    { value: 'lte', label: '小于等于' },
  ],
  date: [
    { value: 'is', label: '是' },
    { value: 'before', label: '早于' },
    { value: 'after', label: '晚于' },
    { value: 'is_empty', label: '为空' },
    { value: 'is_not_empty', label: '不为空' },
  ],
  select: [
    { value: 'is', label: '是' },
    { value: 'is_not', label: '不是' },
    { value: 'is_empty', label: '为空' },
    { value: 'is_not_empty', label: '不为空' },
  ],
  checkbox: [
    { value: 'is', label: '是' },
    { value: 'is_not', label: '不是' },
  ],
};

export function FilterBar({ collection, filters, onFiltersChange }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const properties = collection.properties.filter((p: any) => p.isVisible);

  const handleAddFilter = () => {
    if (properties.length === 0) return;

    const newFilter: Filter = {
      id: crypto.randomUUID(),
      propertyId: properties[0].id,
      operator: 'contains',
      value: '',
    };

    onFiltersChange([...filters, newFilter]);
  };

  const handleRemoveFilter = (filterId: string) => {
    onFiltersChange(filters.filter(f => f.id !== filterId));
  };

  const handleUpdateFilter = (filterId: string, updates: Partial<Filter>) => {
    onFiltersChange(
      filters.map(f => (f.id === filterId ? { ...f, ...updates } : f))
    );
  };

  const getProperty = (propertyId: string) => {
    return properties.find((p: any) => p.id === propertyId);
  };

  const getOperatorsForProperty = (propertyId: string) => {
    const property = getProperty(propertyId);
    if (!property) return [];
    return (operators as any)[property.type] ?? operators.text;
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 rounded-md border border-border px-2 text-ui font-medium text-foreground/55 hover:bg-foreground/4 hover:text-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="mr-1.5 size-3.5" />
        添加筛选
      </Button>
    );
  }

  return (
    <div className="space-y-2 border-b border-border bg-muted/30 px-4 py-3 text-ui">
      <div className="flex items-center justify-between">
        <span className="text-ui font-medium">筛选条件</span>
        <Button variant="ghost" size="sm" className="h-7 rounded-md hover:bg-foreground/4" onClick={() => setIsOpen(false)}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {filters.map(filter => {
          const property = getProperty(filter.propertyId);
          const availableOperators = getOperatorsForProperty(filter.propertyId);

          return (
            <div key={filter.id} className="flex items-center gap-2">
              <select
                value={filter.propertyId}
                onChange={(e) => handleUpdateFilter(filter.id, { propertyId: e.target.value })}
                className="h-7 rounded-md border border-border bg-background px-2 text-ui transition-colors duration-150 hover:bg-foreground/4 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {properties.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={filter.operator}
                onChange={(e) => handleUpdateFilter(filter.id, { operator: e.target.value })}
                className="h-7 rounded-md border border-border bg-background px-2 text-ui transition-colors duration-150 hover:bg-foreground/4 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {availableOperators.map((op: any) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>

              {!['is_empty', 'is_not_empty'].includes(filter.operator) && (
                <input
                  type={property?.type === 'number' ? 'number' : property?.type === 'date' ? 'date' : 'text'}
                  value={filter.value ?? ''}
                  onChange={(e) => handleUpdateFilter(filter.id, { value: e.target.value })}
                  className="h-7 flex-1 rounded-md border border-border bg-background px-2 text-ui focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                  placeholder="值"
                />
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-md hover:bg-foreground/4"
                onClick={() => handleRemoveFilter(filter.id)}
              >
                <X className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button variant="ghost" size="sm" className="h-7 rounded-md text-ui hover:bg-foreground/4" onClick={handleAddFilter}>
        <Plus className="mr-1.5 size-3.5" />
        添加条件
      </Button>
    </div>
  );
}

export function applyFilters(items: any[], filters: Filter[], properties: any[]): any[] {
  if (filters.length === 0) return items;

  return items.filter(item => {
    return filters.every(filter => {
      const property = properties.find((p: any) => p.id === filter.propertyId);
      if (!property) return true;

      const value = item.values?.find((v: any) => v.propertyId === filter.propertyId)?.value;
      const parsed = parseValue(value);

      switch (filter.operator) {
        case 'contains':
          return String(parsed ?? '').toLowerCase().includes(String(filter.value).toLowerCase());
        case 'not_contains':
          return !String(parsed ?? '').toLowerCase().includes(String(filter.value).toLowerCase());
        case 'is':
          return String(parsed ?? '') === String(filter.value);
        case 'is_not':
          return String(parsed ?? '') !== String(filter.value);
        case 'is_empty':
          return parsed == null || parsed === '';
        case 'is_not_empty':
          return parsed != null && parsed !== '';
        case 'eq':
          return Number(parsed) === Number(filter.value);
        case 'ne':
          return Number(parsed) !== Number(filter.value);
        case 'gt':
          return Number(parsed) > Number(filter.value);
        case 'lt':
          return Number(parsed) < Number(filter.value);
        case 'gte':
          return Number(parsed) >= Number(filter.value);
        case 'lte':
          return Number(parsed) <= Number(filter.value);
        case 'before':
          return new Date(parsed) < new Date(filter.value);
        case 'after':
          return new Date(parsed) > new Date(filter.value);
        default:
          return true;
      }
    });
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
