'use client';

import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { addItem, setItemValue } from '@/actions/collection/items';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from 'cn';
import type { getCollection } from '@/actions/collection/collection';

type Collection = Awaited<ReturnType<typeof getCollection>>;
type View = NonNullable<Collection>['views'][number];

interface CalendarViewProps {
  collection: NonNullable<Collection>;
  view: View;
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

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function CalendarView({ collection }: CalendarViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Find the first Date property to use for positioning
  const dateProperty = collection.properties.find((p: any) => p.type === 'date');

  // Group items by date
  const itemsByDate = new Map<string, any[]>();

  if (dateProperty) {
    for (const item of collection.items) {
      const value = item.values?.find((v: any) => v.propertyId === dateProperty.id);
      const parsed = parseValue(value?.value);

      if (parsed && typeof parsed === 'string') {
        const existing = itemsByDate.get(parsed) ?? [];
        existing.push(item);
        itemsByDate.set(parsed, existing);
      }
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddItem = async (date?: string) => {
    const item = await addItem(collection.id);

    if (dateProperty && date) {
      await setItemValue(item.id, dateProperty.id, date);
    }

    router.refresh();
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    handleAddItem(dateStr);
  };

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-[100px] bg-muted/10" />);
  }

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayItems = itemsByDate.get(dateStr) ?? [];

    days.push(
      <div
        key={day}
        className={cn(
          'min-h-[100px] border border-border p-2 transition-colors hover:bg-muted/20 cursor-pointer',
          isToday(day) && 'bg-accent/10'
        )}
        onClick={() => handleDateClick(day)}
      >
        <div className={cn(
          'mb-1 text-sm font-medium',
          isToday(day) && 'text-accent'
        )}>
          {day}
        </div>
        <div className="space-y-1">
          {dayItems.slice(0, 3).map((item: any) => (
            <div
              key={item.id}
              className="truncate rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
            >
              {item.id.slice(0, 8)}
            </div>
          ))}
          {dayItems.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{dayItems.length - 3} 更多
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!dateProperty) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <p className="mb-2 text-lg font-medium">日历视图需要日期属性</p>
          <p className="text-sm text-muted-foreground">
            请添加一个「日期」类型的属性来启用日历视图
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday}>
            今天
          </Button>
        </div>
        <h2 className="text-lg font-semibold">
          {year}年 {monthNames[month]}
        </h2>
        <div className="w-[140px]" />
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-7 gap-px bg-border">
          {dayNames.map(day => (
            <div key={day} className="bg-background px-2 py-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    </div>
  );
}
