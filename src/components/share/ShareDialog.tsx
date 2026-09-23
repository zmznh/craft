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
          <div className="mb-3 flex items-center gap-2">
            <Globe className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">分享此文档</span>
          </div>
          {!link ? (
            <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              生成链接中…
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-md border border-input/30 bg-input/30 px-2">
                  <LinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate text-xs text-muted-foreground">{link}</span>
                </div>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? '已复制' : '复制'}
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <div>
                  <p className="text-sm">发布为公开页面</p>
                  <p className="text-xs text-muted-foreground">
                    在 /p 链接展示带主题的独立页面
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={handlePublishedChange}
                  aria-label="发布为公开页面"
                />
              </div>
              <div className="mt-3 rounded-md border border-border px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <KeyRound className="size-4 text-muted-foreground" />
                  <span className="text-sm">口令保护</span>
                </div>
                {hasPasscode ? (
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      已启用，访问者需输入口令才能查看
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRemovePasscode}
                      className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
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
                      className="h-8 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-xs outline-none transition-colors focus:border-ring"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEnablePasscode}
                      disabled={!passcode.trim()}
                      className="h-8 shrink-0 text-xs"
                    >
                      启用
                    </Button>
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                任何拥有链接的人都可以只读访问该文档
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
