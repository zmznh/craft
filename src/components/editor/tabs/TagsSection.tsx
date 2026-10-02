'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, X } from 'lucide-react';
import {
  attachTag,
  detachTag,
  getDocumentTags,
  getTags,
  type TagRecord,
} from '@/actions/tag/tag';
import { useMetadataRevision } from '@/lib/store/use-sync-store';

/** Tables the tag panel renders; a far-side change here means "reload". */
const TAG_TABLES = ['Tag', 'DocumentTag'];

interface TagsSectionProps {
  documentId: string;
}

export function TagsSection({ documentId }: TagsSectionProps) {
  const [tags, setTags] = useState<TagRecord[]>([]);
  const [all, setAll] = useState<TagRecord[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  // Bumped by the metadata sync provider when another device touched a tag.
  const syncRevision = useMetadataRevision(TAG_TABLES);

  const load = useCallback(async () => {
    const [mine, every] = await Promise.all([getDocumentTags(documentId), getTags()]);
    setTags(mine);
    setAll(every);
  }, [documentId]);

  useEffect(() => {
    void load();
  }, [load, syncRevision]);

  const add = async (name: string) => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      await attachTag(documentId, name);
      setDraft('');
      await load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (tagId: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await detachTag(documentId, tagId);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const unused = all.filter((tag) => !tags.some((own) => own.id === tag.id));

  return (
    <section>
      <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
        标签 ({tags.length})
      </h4>

      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] text-white"
            style={{ backgroundColor: tag.color }}
          >
            <Link href={`/search?tag=${encodeURIComponent(tag.name)}`} className="hover:underline">
              {tag.name}
            </Link>
            <button
              type="button"
              aria-label={`移除标签 ${tag.name}`}
              onClick={() => remove(tag.id)}
              className="opacity-70 hover:opacity-100"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>

      <form
        className="mt-2 flex items-center gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          void add(draft);
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="添加标签"
          aria-label="添加标签"
          className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 py-1 text-[13px] outline-none focus:border-primary"
        />
        <button
          type="submit"
          aria-label="添加标签"
          disabled={busy || !draft.trim()}
          className="rounded-md border border-border p-1 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          <Plus className="size-3.5" />
        </button>
      </form>

      {unused.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {unused.slice(0, 6).map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => void add(tag.name)}
              className="rounded-full border border-dashed border-border px-2 py-0.5 text-[12px] text-muted-foreground transition-colors hover:border-solid hover:text-foreground"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
