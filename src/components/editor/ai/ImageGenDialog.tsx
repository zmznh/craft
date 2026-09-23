'use client';

import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Sparkles } from 'lucide-react';

export const IMAGE_GEN_EVENT = 'crafty:image-gen';

export function requestImageGen(prompt?: string) {
  window.dispatchEvent(
    new CustomEvent(IMAGE_GEN_EVENT, { detail: { prompt: prompt ?? null } })
  );
}

interface ImageGenDialogProps {
  editor: Editor | null;
}

export function ImageGenDialogHost({ editor }: ImageGenDialogProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { prompt?: string | null };
      setPrompt(detail?.prompt ?? '');
      setError(null);
      setPreview(null);
      setOpen(true);
    };
    window.addEventListener(IMAGE_GEN_EVENT, handler);
    return () => window.removeEventListener(IMAGE_GEN_EVENT, handler);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '生成失败');
      setPreview(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (!preview || !editor) return;
    editor.chain().focus().setImageBlock({ src: preview }).run();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4" />
            AI 生成图像
          </DialogTitle>
          <DialogDescription>
            描述你想要的图片，AI 将生成一张 1024x1024 图像
          </DialogDescription>
        </DialogHeader>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例如:一只在星球上骑自行车的宇航员，像素风"
          rows={3}
          className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex min-h-[160px] items-center justify-center overflow-hidden rounded-md border bg-muted/30">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
              生成中，约需十几秒...
            </div>
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="生成结果" className="max-h-64 w-auto" />
          ) : (
            <span className="text-xs text-muted-foreground">
              {error ?? '预览将显示在这里'}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <DialogFooter>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            生成
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!preview}
            className="rounded-md border px-3 py-1.5 text-[13px] transition-colors hover:bg-muted disabled:opacity-50"
          >
            插入文档
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
