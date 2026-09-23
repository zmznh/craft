'use client';

import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { cn } from 'cn';
import type { DailyNoteItem } from '@/actions/daily-notes/daily-notes';

interface DailyNotesListProps {
  groups: { label: string; notes: DailyNoteItem[] }[];
}

export function DailyNotesList({ groups }: DailyNotesListProps) {
  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) =>
        group.notes.length === 0 ? null : (
          <section key={group.label}>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">
              {group.label}
            </h2>
            <div className="flex flex-col">
              {group.notes.map((note) => (
                <Link
                  key={note.id}
                  href={`/documents/${note.id}`}
                  className={cn(
                    'group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors',
                    'hover:bg-muted/60'
                  )}
                >
                  {note.icon ? (
                    <span className="mt-0.5 text-lg leading-none">{note.icon}</span>
                  ) : (
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {note.title}
                      </span>
                    </div>
                    {note.plainText && (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {note.plainText.length > 100
                          ? note.plainText.slice(0, 100) + '…'
                          : note.plainText}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}
