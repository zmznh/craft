'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { Link2, Globe, Loader2 } from 'lucide-react';

interface PreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  siteName: string | null;
}

export function LinkPreviewView({ node, updateAttributes }: NodeViewProps) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);

  const url = node.attrs.url as string;
  const hasMeta = Boolean(node.attrs.title || node.attrs.siteName);

  useEffect(() => {
    if (hasMeta) return;
    let cancelled = false;
    setLoading(true);
    fetch('/api/link-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
      .then((res) => res.json())
      .then((d: PreviewData) => {
        if (cancelled) return;
        setData(d);
        updateAttributes({
          title: d.title ?? null,
          description: d.description ?? null,
          image: d.image ?? null,
          favicon: d.favicon ?? null,
          siteName: d.siteName ?? null,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const title = (node.attrs.title as string) ?? data?.title ?? null;
  const description = (node.attrs.description as string) ?? data?.description ?? null;
  const image = (node.attrs.image as string) ?? data?.image ?? null;
  const favicon = (node.attrs.favicon as string) ?? data?.favicon ?? null;
  const siteName =
    (node.attrs.siteName as string) ?? data?.siteName ?? hostnameOf(url);

  return (
    <NodeViewWrapper as="div" className="my-3">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex overflow-hidden rounded-lg border transition-colors hover:bg-muted/40"
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="hidden h-auto w-40 shrink-0 object-cover sm:block"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {favicon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={favicon} alt="" className="size-3.5 rounded-sm" />
            ) : (
              <Globe className="size-3.5" />
            )}
            <span className="truncate">{siteName}</span>
          </div>
          {loading && !title ? (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              正在获取链接预览...
            </div>
          ) : (
            <>
              <div className="truncate text-[13px] font-medium">
                {title ?? url}
              </div>
              {description && (
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {description}
                </div>
              )}
            </>
          )}
        </div>
      </a>
    </NodeViewWrapper>
  );
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
