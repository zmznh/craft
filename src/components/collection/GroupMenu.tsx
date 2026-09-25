'use client';

import { Button } from '@/components/ui/button';
import { Group, X } from 'lucide-react';
import { useState } from 'react';
import type { getCollection } from '@/actions/collection/collection';

type Collection = Awaited<ReturnType<typeof getCollection>>;

interface GroupMenuProps {
  collection: NonNullable<Collection>;
  groupBy: string | null;
  onGroupByChange: (groupBy: string | null) => void;
}

export function GroupMenu({ collection, groupBy, onGroupByChange }: GroupMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const properties = collection.properties.filter((p: any) => p.isVisible);
  const groupableProperties = properties.filter((p: any) =>
    ['select', 'multi_select', 'checkbox'].includes(p.type)
  );

  const handleSelectGroup = (propertyId: string) => {
    onGroupByChange(propertyId);
    setIsOpen(false);
  };

  const handleClearGroup = () => {
    onGroupByChange(null);
    setIsOpen(false);
  };

  const selectedProperty = groupBy ? properties.find((p: any) => p.id === groupBy) : null;

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 rounded-md border border-border px-2 text-ui font-medium text-foreground/55 hover:bg-foreground/4 hover:text-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Group className="mr-1.5 size-3.5" />
        {selectedProperty ? `按 ${selectedProperty.name} 分组` : '分组'}
      </Button>
    );
  }

  return (
    <div className="space-y-2 border-b border-border bg-muted/30 px-4 py-3 text-ui">
      <div className="flex items-center justify-between">
        <span className="text-ui font-medium">分组方式</span>
        <Button variant="ghost" size="sm" className="h-7 rounded-md hover:bg-foreground/4" onClick={() => setIsOpen(false)}>
          <X className="size-4" />
        </Button>
      </div>

      {groupableProperties.length === 0 ? (
        <p className="text-ui text-foreground/40">
          没有可分组的属性。分组需要单选、多选或复选框类型的属性。
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {groupBy && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-md border-border text-ui hover:bg-foreground/4"
              onClick={handleClearGroup}
            >
              取消分组
            </Button>
          )}
          {groupableProperties.map((property: any) => (
            <Button
              key={property.id}
              variant={groupBy === property.id ? 'default' : 'outline'}
              size="sm"
              className="h-7 rounded-md border-border text-ui transition-colors duration-150 hover:bg-foreground/4 data-active:bg-foreground/4 data-active:text-foreground"
              onClick={() => handleSelectGroup(property.id)}
            >
              {property.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export function applyGrouping(items: any[], groupBy: string | null, properties: any[]): Map<string, any[]> {
  const grouped = new Map<string, any[]>();

  if (!groupBy) {
    grouped.set('all', items);
    return grouped;
  }

  const property = properties.find((p: any) => p.id === groupBy);
  if (!property) {
    grouped.set('all', items);
    return grouped;
  }

  if (property.type === 'select') {
    const config = parseConfig(property.config);
    const options = config.options ?? [];

    for (const option of options) {
      grouped.set(option.id, []);
    }
    grouped.set('__ungrouped__', []);

    for (const item of items) {
      const value = parseValue(item.values?.find((v: any) => v.propertyId === groupBy)?.value);
      if (value && grouped.has(value)) {
        grouped.get(value)!.push(item);
      } else {
        grouped.get('__ungrouped__')!.push(item);
      }
    }
  } else if (property.type === 'checkbox') {
    grouped.set('true', []);
    grouped.set('false', []);

    for (const item of items) {
      const value = parseValue(item.values?.find((v: any) => v.propertyId === groupBy)?.value);
      const key = value ? 'true' : 'false';
      grouped.get(key)!.push(item);
    }
  } else if (property.type === 'multi_select') {
    const config = parseConfig(property.config);
    const options = config.options ?? [];

    for (const option of options) {
      grouped.set(option.id, []);
    }
    grouped.set('__ungrouped__', []);

    for (const item of items) {
      const value = parseValue(item.values?.find((v: any) => v.propertyId === groupBy)?.value);
      if (Array.isArray(value) && value.length > 0) {
        for (const optionId of value) {
          if (grouped.has(optionId)) {
            grouped.get(optionId)!.push(item);
          }
        }
      } else {
        grouped.get('__ungrouped__')!.push(item);
      }
    }
  }

  return grouped;
}

function parseConfig(config: string | null): any {
  if (!config) return {};
  try {
    return typeof config === 'string' ? JSON.parse(config) : config;
  } catch {
    return {};
  }
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
