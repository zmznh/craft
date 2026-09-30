'use client';

import { useState } from 'react';
import { Check, File, Minus, RotateCcw, Trash2, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { restoreDocument, permanentDeleteDocument } from '@/actions/document/delete';
import { useRouter } from 'next/navigation';

interface TrashListProps {
  documents: Array<{
    id: string;
    title: string;
    icon: string | null;
    deletedAt: string | null;
  }>;
}

export function TrashList({ documents }: TrashListProps) {
  const router = useRouter();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const allSelected = selected.size === documents.length;
  const someSelected = selected.size > 0;

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(documents.map(d => d.id)));
  }

  function exitSelection() {
    setSelecting(false);
    setSelected(new Set());
  }

  async function runSelected(action: (id: string) => Promise<void>) {
    setBusy(true);
    try {
      // Sequential on purpose: the server actions are per-document and a
      // rejected one must not leave the rest half-attempted without a signal.
      for (const id of selected) await action(id);
    } finally {
      setBusy(false);
      setConfirmOpen(false);
      exitSelection();
      router.refresh();
    }
  }

  if (documents.length === 0) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center rounded-[15px] bg-foreground/[0.03] px-6 text-center">
        <Trash2 className="mx-auto mb-2 size-8 text-foreground/40" />
        <p className="text-ui font-medium text-foreground/40">回收站是空的</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-2"
      onKeyDown={e => {
        if (e.key === 'Escape' && selecting) exitSelection();
      }}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1" />
        {selecting ? (
          <>
            <span className="text-ui text-foreground/55">
              已选 {selected.size} 项
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="还原所选"
              title="还原所选"
              disabled={!someSelected || busy}
              onClick={() => runSelected(restoreDocument)}
            >
              <RotateCcw />
            </Button>
            <Button
              variant="destructive"
              size="icon-sm"
              aria-label="永久删除所选"
              title="永久删除所选"
              disabled={!someSelected || busy}
              onClick={() => setConfirmOpen(true)}
            >
              <Trash />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-md text-ui"
            onClick={() => setSelecting(true)}
          >
            选择
          </Button>
        )}
      </div>

      {selecting && (
        <button
          type="button"
          role="checkbox"
          aria-checked={allSelected ? true : someSelected ? 'mixed' : false}
          aria-label="全选"
          onClick={toggleAll}
          className="flex w-fit items-center gap-2 text-ui text-foreground/55"
        >
          <SelectionMark state={allSelected ? 'on' : someSelected ? 'mixed' : 'off'} />
          全选
        </button>
      )}

      {documents.map(doc => {
        const deletedDate = doc.deletedAt
          ? new Date(doc.deletedAt).toLocaleDateString('zh-CN')
          : '';
        const isChecked = selected.has(doc.id);

        return (
          <div
            key={doc.id}
            className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors duration-150 hover:bg-foreground/[0.03]"
          >
            {selecting ? (
              <button
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                aria-label={`选择 ${doc.title || '无标题文档'}`}
                onClick={() => toggle(doc.id)}
                className="shrink-0"
              >
                <SelectionMark state={isChecked ? 'on' : 'off'} />
              </button>
            ) : (
              doc.icon ? (
                <span className="text-xl">{doc.icon}</span>
              ) : (
                <File className="size-5 shrink-0 text-foreground/40" />
              )
            )}
            <div className="flex-1 truncate">
              <p className="truncate text-body font-medium">{doc.title}</p>
              <p className="text-meta text-foreground/55">
                删除于 {deletedDate}
              </p>
            </div>
            {!selecting && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-md text-ui hover:bg-foreground/4"
                onClick={() => restoreDocument(doc.id).then(() => router.refresh())}
              >
                恢复
              </Button>
            )}
          </div>
        );
      })}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              删除 {selected.size} 个项目 你确定吗？你无法撤销此操作。
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => setConfirmOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={busy}
              onClick={() => runSelected(permanentDeleteDocument)}
            >
              {busy ? '删除中…' : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SelectionMark({ state }: { state: 'on' | 'off' | 'mixed' }) {
  if (state === 'on') {
    return (
      <span className="flex size-[18px] items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-3" />
      </span>
    );
  }
  if (state === 'mixed') {
    return (
      <span className="flex size-[18px] items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Minus className="size-3" />
      </span>
    );
  }
  return (
    <span className="block size-[18px] rounded-full border border-foreground/25" />
  );
}
