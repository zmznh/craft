'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Copy, PencilLine, Eye, Link2Off } from 'lucide-react';
import { getWhiteboardShare, setWhiteboardShare } from '@/actions/whiteboard/share';
import type { WhiteboardSharePermission } from '@/lib/whiteboard-sharing/access';
import { cn } from 'cn';

interface WhiteboardShareDialogProps {
  whiteboardId: string;
  open: boolean;
  onClose: () => void;
}

const OPTIONS: { value: WhiteboardSharePermission; label: string; hint: string; icon: typeof Eye }[] = [
  { value: 'off', label: '关闭', hint: '仅自己可访问，已有链接立即失效', icon: Link2Off },
  { value: 'view', label: '查看', hint: '拿到链接的人可以查看，不能修改', icon: Eye },
  { value: 'edit', label: '编辑', hint: '登录用户可以协作编辑；匿名访客只读', icon: PencilLine },
];

export function WhiteboardShareDialog({ whiteboardId, open, onClose }: WhiteboardShareDialogProps) {
  // null until the server tells us: the dialog unmounts on close, so starting
  // from 'off' would swallow a "turn sharing off" click as a no-op change.
  const [permission, setPermission] = useState<WhiteboardSharePermission | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  /** Bumped by every read and every local choice, so a slow read cannot overwrite a click. */
  const revision = useRef(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const mine = ++revision.current;
    setWarning(null);
    getWhiteboardShare(whiteboardId)
      .then((state) => {
        if (cancelled || mine !== revision.current) return;
        setPermission(state.permission);
        setUrl(state.url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, whiteboardId]);

  const choose = (next: WhiteboardSharePermission) => {
    if (next === permission) return;
    revision.current += 1;
    setPermission(next);
    startTransition(async () => {
      try {
        const result = await setWhiteboardShare(whiteboardId, next);
        setUrl(result.url);
        if (!result.disconnected) {
          setWarning('同步服务未响应，已连接的访客可能需要稍等才会断开');
        }
      } catch (error) {
        setPermission(permission);
        setWarning(error instanceof Error ? error.message : '设置失败');
      }
    });
  };

  const copy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const activeHint = permission === null
    ? null
    : OPTIONS.find((option) => option.value === permission)?.hint ?? null;

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="max-w-md">
        <DialogTitle>分享白板</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          白板通过实时同步服务协作，链接默认关闭。
        </DialogDescription>

        <div className="flex flex-col gap-2">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = option.value === permission;
            return (
              <button
                key={option.value}
                type="button"
                data-share-permission={option.value}
                onClick={() => choose(option.value)}
                aria-pressed={selected}
                disabled={permission === null || pending}
                className={cn(
                  'flex items-start gap-3 rounded-lg border border-border px-3 py-2.5 text-left transition-colors hover:bg-muted',
                  selected && 'border-primary bg-muted',
                )}
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="block text-xs text-muted-foreground">{option.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        {permission !== 'off' && url && (
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 text-xs">{url}</code>
            <Button type="button" size="sm" variant="outline" onClick={copy} disabled={pending}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? '已复制' : '复制'}
            </Button>
          </div>
        )}

        {warning && <p className="text-xs text-destructive">{warning}</p>}
        {activeHint && <p className="text-xs text-muted-foreground">{activeHint}</p>}
      </DialogContent>
    </Dialog>
  );
}
