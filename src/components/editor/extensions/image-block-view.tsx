'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useRef, useState } from 'react';
import { ImagePlus, Link2, Loader2 } from 'lucide-react';
import { uploadFile } from '@/lib/upload-client';

export function ImageBlockView({ node, updateAttributes }: NodeViewProps) {
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const src = node.attrs.src as string | null;
  const alt = node.attrs.alt as string;
  const caption = node.attrs.caption as string;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('仅支持图片文件');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      updateAttributes({ src: url, alt: file.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleUrl = () => {
    const url = window.prompt('输入图片 URL:');
    if (url) updateAttributes({ src: url, alt: null });
  };

  return (
    <NodeViewWrapper as="div" className="my-4">
      <figure
        className={`group relative rounded-lg transition-colors ${
          dragOver ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
      >
        {!src ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/60"
          >
            {uploading ? (
              <>
                <Loader2 className="size-6 animate-spin" />
                <span className="text-sm">上传中...</span>
              </>
            ) : (
              <>
                <ImagePlus className="size-6" />
                <span className="text-sm">点击上传图片，或拖拽 / 粘贴图片到这里</span>
              </>
            )}
          </button>
        ) : (
          <>
            {!loaded && (
              <div className="flex h-48 items-center justify-center rounded-lg bg-muted">
                <div className="size-6 animate-pulse rounded-full bg-muted-foreground/20" />
              </div>
            )}
            <img
              src={src}
              alt={alt || ''}
              onLoad={() => setLoaded(true)}
              className={`max-h-[500px] w-full rounded-lg object-contain transition-opacity ${
                loaded ? 'opacity-100' : 'opacity-0 h-0'
              }`}
            />
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex size-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-background hover:text-foreground"
                title="重新上传"
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ImagePlus className="size-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handleUrl}
                className="flex size-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-background hover:text-foreground"
                title="图片 URL"
              >
                <Link2 className="size-4" />
              </button>
            </div>
          </>
        )}
        {caption && (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground">
            {caption}
          </figcaption>
        )}
        {error && (
          <div className="mt-1 text-center text-xs text-destructive">{error}</div>
        )}
      </figure>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </NodeViewWrapper>
  );
}
