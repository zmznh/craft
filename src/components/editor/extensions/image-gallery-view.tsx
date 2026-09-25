'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useRef, useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { uploadFile } from '@/lib/upload-client';

interface GalleryImage {
  src: string;
  caption?: string | null;
}

export function ImageGalleryView({ node, updateAttributes }: NodeViewProps) {
  const images = (node.attrs.images as GalleryImage[] | undefined) ?? [];
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const count = images.length;
  const cols = count === 1 ? 1 : count === 2 ? 2 : 3;

  const setImages = (next: GalleryImage[]) => {
    updateAttributes({ images: next });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const added: GalleryImage[] = [];
      for (const file of Array.from(files)) {
        const { url } = await uploadFile(file);
        added.push({ src: url, caption: null });
      }
      setImages([...images, ...added]);
    } catch (err) {
      alert(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <NodeViewWrapper as="div" className="my-4">
      <div className="rounded-lg">
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {images.map((img, i) => (
            <figure key={i} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.caption ?? ''}
                className="h-40 w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, j) => j !== i))}
                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:text-destructive group-hover:opacity-100"
                title="移除"
              >
                <X className="size-3.5" />
              </button>
              {img.caption && (
                <figcaption className="mt-1 truncate text-center text-meta text-foreground/40">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
          {uploading && (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-foreground/15 bg-foreground/4">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        {count === 0 && !uploading && (
          <p className="mb-2 text-center text-ui text-foreground/40">
            图片网格 - 点击下方按钮添加图片
          </p>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-foreground/15 py-1.5 text-meta text-foreground/40 transition-colors duration-150 ease-craft hover:bg-foreground/4 hover:text-foreground/70 disabled:opacity-50"
        >
          <Plus className="size-3.5" />
          添加图片
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </NodeViewWrapper>
  );
}
