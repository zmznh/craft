'use client';

import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Check, X } from 'lucide-react';
import type { Editor } from '@tiptap/react';
import { createThread, getThreads, addReply, setThreadResolved } from '@/actions/comment/comment';

interface CommentRow {
  id: string;
  body: string;
  mine: boolean;
}

interface ThreadRow {
  id: string;
  blockText: string;
  resolved: boolean;
  comments: CommentRow[];
}

interface CommentSectionProps {
  documentId: string;
  editor: Editor | null;
}

export function CommentSection({ documentId, editor }: CommentSectionProps) {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [draft, setDraft] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [showComposer, setShowComposer] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  const reload = useCallback(async () => {
    try {
      const rows = await getThreads(documentId);
      setThreads(rows as ThreadRow[]);
    } catch {
      setThreads([]);
    }
  }, [documentId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!editor) return;
    const refresh = () => setHasSelection(!editor.state.selection.empty);
    refresh();
    editor.on('selectionUpdate', refresh);
    return () => {
      editor.off('selectionUpdate', refresh);
    };
  }, [editor]);

  const handleCreate = async () => {
    if (!editor || !draft.trim()) return;
    const { from, to } = editor.state.selection;

    // 找到选区起点所在最底层 block 作为锚点
    const parent = editor.state.doc.resolve(from).parent;
    const blockText = parent.textBetween(0, parent.content.size, '\n', '');

    try {
      const created = await createThread(documentId, { blockText, body: draft });
      editor.chain().focus().setComment(created.threadId).run();
      setDraft('');
      setShowComposer(false);
      await reload();
    } catch {
      // 提交失败保持草稿
    }
  };

  const handleReply = async (threadId: string) => {
    const body = replyDrafts[threadId]?.trim();
    if (!body) return;
    try {
      await addReply(threadId, body);
      setReplyDrafts((prev) => ({ ...prev, [threadId]: '' }));
      await reload();
    } catch {
      // 提交失败保持草稿
    }
  };

  const handleResolve = async (threadId: string, resolved: boolean) => {
    try {
      await setThreadResolved(threadId, resolved);
      await reload();
    } catch {
      // 状态更新失败保持原状
    }
  };

  const openThreads = threads.filter((thread) => !thread.resolved);
  const resolvedThreads = threads.filter((thread) => thread.resolved);

  return (
    <section>
      <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
        <MessageSquare className="size-3" />
        评论 ({openThreads.length})
      </h4>

      {hasSelection && !showComposer && (
        <button
          type="button"
          onClick={() => setShowComposer(true)}
          className="mb-2 w-full rounded-md border border-border px-2 py-1.5 text-[12px] transition-colors hover:bg-muted"
        >
          评论所选文本
        </button>
      )}
      {showComposer && (
        <div className="mb-2 rounded-md border border-border p-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={2}
            placeholder="写下评论..."
            className="w-full resize-none rounded-md border border-border bg-transparent p-2 text-[12px] outline-none focus:border-primary"
          />
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => setShowComposer(false)}
              className="rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              取消
            </button>
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={handleCreate}
              className="rounded-md bg-primary px-2 py-1 text-[11px] text-primary-foreground disabled:opacity-50"
            >
              发布
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {openThreads.map((thread) => (
          <div key={thread.id} className="rounded-md border border-border p-2">
            {thread.blockText && (
              <p className="mb-1.5 line-clamp-2 border-l-2 border-border pl-2 text-[11px] text-muted-foreground">
                {thread.blockText}
              </p>
            )}
            {thread.comments.map((comment) => (
              <p key={comment.id} className="text-[12px]">
                {comment.body}
              </p>
            ))}
            <div className="mt-1.5 flex items-center gap-1">
              <input
                value={replyDrafts[thread.id] ?? ''}
                onChange={(event) =>
                  setReplyDrafts((prev) => ({ ...prev, [thread.id]: event.target.value }))
                }
                placeholder="回复..."
                className="flex-1 rounded-md border border-border bg-transparent px-2 py-1 text-[11px] outline-none focus:border-primary"
              />
              <button
                type="button"
                disabled={!replyDrafts[thread.id]?.trim()}
                onClick={() => void handleReply(thread.id)}
                className="rounded-md px-2 py-1 text-[11px] text-primary disabled:opacity-50"
              >
                回复
              </button>
              <button
                type="button"
                title="解决"
                onClick={() => void handleResolve(thread.id, true)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <Check className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
        {resolvedThreads.length > 0 && (
          <details>
            <summary className="cursor-pointer text-[11px] text-muted-foreground">
              已解决 ({resolvedThreads.length})
            </summary>
            {resolvedThreads.map((thread) => (
              <div
                key={thread.id}
                className="mt-1 flex items-center justify-between rounded-md border border-border p-2 opacity-60"
              >
                <span className="line-clamp-1 text-[11px]">{thread.comments[0]?.body}</span>
                <button
                  type="button"
                  title="重新打开"
                  onClick={() => void handleResolve(thread.id, false)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </details>
        )}
      </div>
    </section>
  );
}
