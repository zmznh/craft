'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Check,
  Copy,
  Globe,
  KeyRound,
  LinkIcon,
  Loader2,
  X,
} from 'lucide-react';
import {
  getOrCreateShare,
  setSharePasscode,
  setSharePublished,
} from '@/actions/document/share';
import { cn } from 'cn';

interface ShareDialogProps {
  documentId: string;
  open: boolean;
  onClose: () => void;
}

export function ShareDialog({ documentId, open, onClose }: ShareDialogProps) {
  const [link, setLink] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [hasPasscode, setHasPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open || link) return;
    let cancelled = false;
    getOrCreateShare(documentId)
      .then((share) => {
        if (!cancelled) {
          setLink(`${window.location.origin}/s/${share.token}`);
          setIsPublished(share.isPublished);
          setHasPasscode(share.hasPasscode);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, link, documentId]);

  const handlePublishedChange = (checked: boolean) => {
    setIsPublished(checked);
    startTransition(async () => {
      await setSharePublished(documentId, checked);
    });
  };

  const handleEnablePasscode = () => {
    if (!passcode.trim()) return;
    startTransition(async () => {
      await setSharePasscode(documentId, passcode.trim());
      setHasPasscode(true);
      setPasscode('');
    });
  };

  const handleRemovePasscode = () => {
    startTransition(async () => {
      await setSharePasscode(documentId, null);
      setHasPasscode(false);
      setPasscode('');
    });
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  const handleCopy = async () => {
    if (link) {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-xl! p-0">
        <DialogTitle className="sr-only">分享文档</DialogTitle>
        <DialogDescription className="sr-only">
          生成并复制此文档的只读分享链接
        </DialogDescription>
        <div className="p-4">
          {/* 分段 tab：pill 分段控件（design-spec §3） */}
          <div
            role="tablist"
            aria-label="分享方式"
            className="mx-4 mt-4 mb-3 flex h-[26px] items-center gap-0.5 rounded-full p-0.5"
          >
            {(['share', 'publish', 'export'] as const).map((seg) => (
              <button
                key={seg}
                type="button"
                role="tab"
                aria-selected={seg === 'share'}
                className={cn(
                  'h-full flex-1 rounded-full px-2 text-[16px] leading-none transition-colors duration-150 ease-craft',
                  seg === 'share'
                    ? 'bg-foreground/4 text-foreground/85'
                    : 'text-foreground/55 hover:text-foreground/85'
                )}
              >
                {seg === 'share' ? '共享' : seg === 'publish' ? '发布' : '导出'}
              </button>
            ))}
          </div>
          <div className="mb-3 flex items-center gap-2">
            <Globe className="size-4 text-foreground/55" />
            <span className="text-ui font-medium">分享此文档</span>
          </div>
          {!link ? (
            <div className="flex items-center gap-2 py-3 text-ui text-foreground/40">
              <Loader2 className="size-4 animate-spin" />
              生成链接中…
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="flex h-[34px] min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-foreground/10 bg-foreground/4 px-2.5">
                  <LinkIcon className="size-3.5 shrink-0 text-foreground/40" />
                  <span className="truncate text-ui text-foreground/55">{link}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-craft-accent px-4 text-ui font-medium text-white transition-colors duration-150 ease-craft hover:bg-craft-accent-hover"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? '已复制' : '复制链接'}
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg border border-foreground/10 px-3 py-2.5">
                <div>
                  <p className="text-ui">发布为公开页面</p>
                  <p className="text-meta text-foreground/40">
                    在 /p 链接展示带主题的独立页面
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={handlePublishedChange}
                  aria-label="发布为公开页面"
                />
              </div>
              <div className="mt-3 rounded-lg border border-foreground/10 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <KeyRound className="size-4 text-foreground/55" />
                  <span className="text-ui">口令保护</span>
                </div>
                {hasPasscode ? (
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-meta text-foreground/40">
                      已启用，访问者需输入口令才能查看
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRemovePasscode}
                      className="h-7 gap-1 px-2 text-meta text-foreground/40 hover:text-destructive"
                    >
                      <X className="size-3.5" />
                      清除
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEnablePasscode();
                      }}
                      placeholder="设置访问口令"
                      aria-label="设置访问口令"
                      className="h-8 min-w-0 flex-1 rounded-lg border border-foreground/10 bg-foreground/4 px-2 text-ui outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEnablePasscode}
                      disabled={!passcode.trim()}
                      className="h-8 shrink-0 rounded-lg px-4 text-ui shadow-[inset_0_0_0_1px_rgb(26_28_30_/_0.08)] hover:bg-foreground/4 dark:shadow-[inset_0_0_0_1px_rgb(249_249_249_/_0.12)]"
                    >
                      启用
                    </Button>
                  </div>
                )}
              </div>
              <p className="mt-3 text-meta text-foreground/40">
                任何拥有链接的人都可以只读访问该文档
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
