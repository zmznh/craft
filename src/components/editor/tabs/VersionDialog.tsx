'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { History, RotateCcw, Loader2 } from 'lucide-react';
import {
  getVersions,
  getVersionContent,
  restoreVersion,
  type VersionItem,
} from '@/actions/version';

interface VersionDialogProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function VersionDialog({ documentId, open, onOpenChange }: VersionDialogProps) {
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setPreviewText(null);
    setPreviewId(null);
    getVersions(documentId)
      .then(setVersions)
      .catch(() => setVersions([]))
      .finally(() => setLoading(false));
  }, [open, documentId]);

  const handlePreview = async (id: string) => {
    setPreviewId(id);
    setPreviewText(null);
    try {
      const v = await getVersionContent(id);
      setPreviewText(v.plainText || '(空白内容)');
    } catch {
      setPreviewText('(无法加载预览)');
    }
  };

  const handleRestore = async (id: string) => {
    if (!window.confirm('恢复此版本?当前内容会先另存为一个版本。')) return;
    setRestoring(id);
    try {
      await restoreVersion(id);
      onOpenChange(false);
      window.location.reload();
    } catch {
      setRestoring(null);
      alert('恢复失败');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[70vh] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-4" />
            版本历史
          </DialogTitle>
          <DialogDescription>
            每次编辑超过 10 分钟间隔会自动保存一个版本
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
          <div className="min-h-0 w-44 shrink-0 space-y-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
              </div>
            ) : versions.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                暂无版本
              </div>
            ) : (
              versions.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handlePreview(v.id)}
                  className={`w-full rounded-md px-2 py-1.5 text-left transition-colors ${
                    previewId === v.id
                      ? 'bg-muted'
                      : 'hover:bg-muted/60'
                  }`}
                >
                  <div className="text-[13px] font-medium">
                    v{v.version} · {formatTime(v.createdAt)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {v.wordCount} 字
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-md border bg-muted/30 p-3">
            {previewId === null ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                选择左侧版本查看内容
              </div>
            ) : previewText === null ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
              </div>
            ) : (
              <>
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                  {previewText}
                </p>
                <button
                  type="button"
                  onClick={() => handleRestore(previewId)}
                  disabled={restoring !== null}
                  className="mt-3 flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {restoring ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="size-3.5" />
                  )}
                  恢复此版本
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
