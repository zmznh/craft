'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckSquare, FileText, Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from 'cn';
import {
  createTask,
  deleteTask,
  getTasks,
  toggleTask,
} from '@/actions/task/task';
import type { TaskItem } from '@/actions/task/task';

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
    await toggleTask(id);
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
      <div className="mx-auto max-w-3xl px-8 py-8">
        <h1 className="mb-6 text-2xl font-semibold">任务收件箱</h1>

        <div className="mb-6 flex gap-2">
          <Input
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
                <TaskList items={active} onToggle={handleToggle} onDelete={handleDelete} />
              )}
            </section>

            {completed.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-medium text-muted-foreground">
                  已完成 · {completed.length}
                </h2>
                <TaskList items={completed} onToggle={handleToggle} onDelete={handleDelete} />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TaskList({
  items,
  onToggle,
  onDelete,
}: {
  items: TaskItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-col">
      {items.map((task) => (
        <div
          key={task.id}
          className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/60"
        >
          <Checkbox
            checked={task.isCompleted}
            onCheckedChange={() => onToggle(task.id)}
          />
          <span
            className={cn(
              'flex-1 truncate text-sm',
              task.isCompleted && 'text-muted-foreground line-through'
            )}
          >
            {task.title}
          </span>
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
              {new Date(task.dueDate).toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            aria-label="删除任务"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
