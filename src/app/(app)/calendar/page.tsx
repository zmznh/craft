'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, CheckSquare, FileText } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from 'cn';
import { getTasks, toggleTask } from '@/actions/task/task';
import type { TaskItem } from '@/actions/task/task';
import { getDailyNotes } from '@/actions/daily-notes/daily-notes';
import type { DailyNoteItem } from '@/actions/daily-notes/daily-notes';

export default function CalendarPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [notes, setNotes] = useState<DailyNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  const load = useCallback(async () => {
    try {
      const [taskData, noteData] = await Promise.all([getTasks(), getDailyNotes()]);
      setTasks(taskData);
      setNotes(noteData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, TaskItem[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = new Date(task.dueDate).toDateString();
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    }
    return map;
  }, [tasks]);

  const notesByDay = useMemo(() => {
    const map = new Map<string, DailyNoteItem>();
    for (const note of notes) {
      if (!note.dailyNoteDate) continue;
      map.set(new Date(note.dailyNoteDate).toDateString(), note);
    }
    return map;
  }, [notes]);

  const handleToggle = async (id: string) => {
    await toggleTask(id);
    await load();
  };

  const selectedKey = selected?.toDateString();
  const selectedTasks = selectedKey ? tasksByDay.get(selectedKey) ?? [] : [];
  const selectedNote = selectedKey ? notesByDay.get(selectedKey) : undefined;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-8 py-8">
        <h1 className="mb-6 text-2xl font-semibold">日历</h1>

        {loading ? (
          <p className="text-sm text-muted-foreground">加载中…</p>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="shrink-0 rounded-lg border border-border p-3">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={setSelected}
                month={month}
                onMonthChange={setMonth}
                modifiers={{
                  withTask: (date) => tasksByDay.has(date.toDateString()),
                  withNote: (date) => notesByDay.has(date.toDateString()),
                }}
                modifiersClassNames={{
                  withTask: 'calendar-has-task',
                  withNote: 'calendar-has-note',
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                {selected
                  ? selected.toLocaleDateString('zh-CN', {
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long',
                    })
                  : '选择日期'}
              </h2>

              {!selectedNote && selectedTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <CalendarIcon className="mx-auto mb-2 size-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">这一天暂无任务或日记</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {selectedNote && (
                    <Link
                      href={`/documents/${selectedNote.id}`}
                      className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted/60"
                    >
                      {selectedNote.icon ? (
                        <span className="text-lg leading-none">{selectedNote.icon}</span>
                      ) : (
                        <FileText className="size-4 text-muted-foreground" />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {selectedNote.title}
                        </span>
                        {selectedNote.plainText && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {selectedNote.plainText.slice(0, 60)}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}

                  {selectedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/60"
                    >
                      <Checkbox
                        checked={task.isCompleted}
                        onCheckedChange={() => handleToggle(task.id)}
                      />
                      <span
                        className={cn(
                          'flex-1 truncate text-sm',
                          task.isCompleted && 'text-muted-foreground line-through'
                        )}
                      >
                        {task.title}
                      </span>
                      {task.documentId && (
                        <Link
                          href={`/documents/${task.documentId}`}
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          <CheckSquare className="size-4" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
