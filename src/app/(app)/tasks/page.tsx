'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CalendarClock, CheckSquare, FileText, Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from 'cn';
import { RECURRENCE_PRESETS } from '@/lib/task/recurrence';
import {
  createTask,
  deleteTask,
  getTasks,
  setTaskSchedule,
  toggleTask,
} from '@/actions/task/task';
import type { TaskItem, TaskSchedule } from '@/actions/task/task';
import { AppPageContainer } from '@/components/app/AppPageContainer';
import { AppPageHeader } from '@/components/app/AppPageHeader';

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const data = await getTasks();
    setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await createTask(newTitle);
      setNewTitle('');
      await load();
      router.refresh();
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id: string) => {
    await toggleTask(id, Intl.DateTimeFormat().resolvedOptions().timeZone);
    await load();
  };

  const handleSchedule = async (id: string, schedule: TaskSchedule) => {
    await setTaskSchedule(id, schedule);
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    await load();
  };

  const active = tasks.filter((t) => !t.isCompleted);
  const completed = tasks.filter((t) => t.isCompleted);

  return (
    <div className="flex-1 overflow-y-auto">
      <AppPageHeader
        title="任务收件箱"
        actions={
          <div className="flex min-w-0 gap-2">
            <Input
              className="w-32 sm:w-56"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              placeholder="添加任务，按回车确认…"
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newTitle.trim()}
              className="flex shrink-0 items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground transition-opacity disabled:opacity-50"
            >
              <Plus className="size-4" />
              添加
            </button>
          </div>
        }
      />
      <AppPageContainer className="max-w-3xl">
        {loading ? (
          <p className="text-sm text-muted-foreground">加载中…</p>
        ) : (
          <>
            <section className="mb-8">
              {active.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <CheckSquare className="mx-auto mb-2 size-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    全部完成！在文档中使用任务列表，勾选的任务会同步到这里
                  </p>
                </div>
              ) : (
                <TaskList
                  items={active}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onSchedule={handleSchedule}
                />
              )}
            </section>

            {completed.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-medium text-muted-foreground">
                  已完成 · {completed.length}
                </h2>
                <TaskList
                  items={completed}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onSchedule={handleSchedule}
                />
              </section>
            )}
          </>
        )}
      </AppPageContainer>
    </div>
  );
}

function TaskList({
  items,
  onToggle,
  onDelete,
  onSchedule,
}: {
  items: TaskItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSchedule: (id: string, schedule: TaskSchedule) => Promise<void>;
}) {
  return (
    <div className="flex flex-col">
      {items.map((task) => (
        <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onSchedule={onSchedule} />
      ))}
    </div>
  );
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
  yearly: '每年',
};

function toDayInput(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toMomentInput(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${toDayInput(value)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function fromDayInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function fromMomentInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function TaskRow({
  task,
  onToggle,
  onDelete,
  onSchedule,
}: {
  task: TaskItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSchedule: (id: string, schedule: TaskSchedule) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const schedule = {
    dueDate: task.dueDate,
    remindAt: task.remindAt,
    recurrence: task.recurrence,
    recurrenceEnd: task.recurrenceEnd,
  };

  const update = (patch: Partial<TaskSchedule>) => {
    void onSchedule(task.id, { ...schedule, ...patch });
  };

  return (
    <div className="border-b border-border/40 last:border-0">
      <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/60">
        <Checkbox checked={task.isCompleted} onCheckedChange={() => onToggle(task.id)} />
        <span
          className={cn(
            'flex-1 truncate text-sm',
            task.isCompleted && 'text-muted-foreground line-through'
          )}
        >
          {task.title}
        </span>

        {task.recurrence && (
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {FREQUENCY_LABELS[parseFrequency(task.recurrence)] ?? '重复'}
          </span>
        )}
        {task.remindAt && (
          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Bell className="size-3.5" />
            {new Date(task.remindAt).toLocaleString('zh-CN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
        {task.documentId && task.documentTitle && (
          <Link
            href={`/documents/${task.documentId}`}
            className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <FileText className="size-3.5" />
            <span className="max-w-32 truncate">{task.documentTitle}</span>
          </Link>
        )}
        {task.dueDate && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {new Date(task.dueDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
          </span>
        )}

        <button
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="设置提醒与重复"
          className={cn(
            'shrink-0 rounded p-1 transition-opacity hover:text-foreground',
            open ? 'text-foreground' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
          )}
        >
          <CalendarClock className="size-4" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          aria-label="删除任务"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {open && (
        <div className="grid gap-2 px-3 pb-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            截止日期
            <Input
              type="date"
              value={toDayInput(task.dueDate)}
              onChange={(event) => update({ dueDate: fromDayInput(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            提醒时间
            <Input
              type="datetime-local"
              value={toMomentInput(task.remindAt)}
              onChange={(event) => update({ remindAt: fromMomentInput(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            重复
            <select
              value={task.recurrence ?? ''}
              onChange={(event) => update({ recurrence: event.target.value || null })}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
            >
              <option value="">不重复</option>
              {RECURRENCE_PRESETS.filter((preset) => preset.value).map((preset) => (
                <option key={preset.label} value={preset.value!}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            重复结束于
            <Input
              type="date"
              disabled={!task.recurrence}
              value={toDayInput(task.recurrenceEnd)}
              onChange={(event) => update({ recurrenceEnd: fromDayInput(event.target.value) })}
            />
          </label>
        </div>
      )}
    </div>
  );
}

function parseFrequency(raw: string | null): string {
  try {
    return String((JSON.parse(raw ?? '') as { freq?: string }).freq ?? '');
  } catch {
    return '';
  }
}
