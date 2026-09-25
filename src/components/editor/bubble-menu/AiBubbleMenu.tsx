'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/react';
import { Image as ImageIcon, Loader2, Sparkles, X } from 'lucide-react';
import { cn } from 'cn';
import { useAiBubbleStore } from '@/lib/store/use-ai-bubble-store';
import { aiBubbleKey, mainBubbleKey } from './keys';
import { requestImageGen } from '@/components/editor/ai/ImageGenDialog';

interface AiBubbleMenuProps {
  editor: Editor;
}

type AiAction = 'rewrite' | 'continue' | 'translate' | 'summarize';

const actions: { id: AiAction; label: string; replace: boolean }[] = [
  { id: 'rewrite', label: '改写', replace: true },
  { id: 'continue', label: '续写', replace: false },
  { id: 'translate', label: '翻译', replace: true },
  { id: 'summarize', label: '总结', replace: true },
];

interface CapturedSelection {
  from: number;
  to: number;
  text: string;
}

export function AiBubbleMenu({ editor }: AiBubbleMenuProps) {
  const isOpen = useAiBubbleStore((s) => s.isOpen);
  const close = useAiBubbleStore((s) => s.close);
  const [loading, setLoading] = useState<AiAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pendingReplace, setPendingReplace] = useState(false);
  const capturedRef = useRef<CapturedSelection | null>(null);

  const reset = useCallback(() => {
    setLoading(null);
    setError(null);
    setResult(null);
    setPendingReplace(false);
  }, []);

  // the bubble plugin only re-evaluates shouldShow on selection/doc changes,
  // so show/hide must go through its explicit transaction meta
  const showBubble = useCallback(() => {
    editor.view.dispatch(
      editor.state.tr.setMeta(aiBubbleKey, 'show').setMeta(mainBubbleKey, 'hide')
    );
  }, [editor]);

  const hideBubble = useCallback(() => {
    editor.view.dispatch(editor.state.tr.setMeta(aiBubbleKey, 'hide'));
  }, [editor]);

  const handleClose = useCallback(() => {
    close();
    reset();
    hideBubble();
  }, [close, reset, hideBubble]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        const wasOpen = useAiBubbleStore.getState().isOpen;
        if (wasOpen) {
          handleClose();
          return;
        }
        if (!editor.state.selection.empty) {
          useAiBubbleStore.getState().open();
          showBubble();
        }
        return;
      }
      if (e.key === 'Escape' && useAiBubbleStore.getState().isOpen) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, handleClose]);

  const runAction = useCallback(
    async (action: AiAction, replace: boolean) => {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, '\n');
      if (!selectedText.trim()) return;

      // capture selection before the await; the selection may drift afterwards
      capturedRef.current = { from, to, text: selectedText };
      setPendingReplace(replace);
      setLoading(action);
      setError(null);
      setResult(null);
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, text: selectedText }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'AI 请求失败');
          return;
        }
        setResult(data.text);
      } catch {
        setError('网络错误，请重试');
      } finally {
        setLoading(null);
      }
    },
    [editor]
  );

  const applyResult = useCallback(
    (mode: 'replace' | 'insert-below') => {
      const captured = capturedRef.current;
      if (!captured || result === null) return;
      if (mode === 'replace') {
        editor
          .chain()
          .focus()
          .insertContentAt({ from: captured.from, to: captured.to }, result)
          .run();
      } else {
        editor
          .chain()
          .focus()
          .insertContentAt(captured.to, ` ${result}`)
          .run();
      }
      handleClose();
    },
    [editor, result, handleClose]
  );

  return (
    <TiptapBubbleMenu
      editor={editor}
      pluginKey={aiBubbleKey}
      options={{ placement: 'top' }}
      shouldShow={({ state, from, to }) =>
        useAiBubbleStore.getState().isOpen && state.selection.from === from && from !== to
      }
    >
      <div className="w-64 rounded-md bg-[rgb(250,250,250)] p-1.5 shadow-md animate-in fade-in-0 zoom-in-95 duration-150 dark:bg-[#242424]">
        <div className="mb-1 flex items-center justify-between px-1">
          <span className="flex items-center gap-1.5 text-meta font-medium text-foreground/40">
            <Sparkles className="size-3.5" />
            AI 助手
          </span>
          <button
            type="button"
            onClick={handleClose}
            aria-label="关闭"
            className="flex size-5 items-center justify-center rounded-md text-foreground/40 transition-colors duration-150 ease-craft hover:bg-foreground/4 hover:text-foreground/85"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {result === null ? (
          <>
            <div className="grid grid-cols-2 gap-1">
              {actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  disabled={loading !== null}
                  onClick={() => runAction(action.id, action.replace)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-ui transition-colors duration-150 ease-craft',
                    'text-foreground/85 hover:bg-foreground/4 disabled:opacity-50'
                  )}
                >
                  {loading === action.id ? (
                    <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                  ) : (
                    <Sparkles className="size-3.5 text-muted-foreground" />
                  )}
                  {action.label}
                </button>
              ))}
            </div>
            <button
              key="imageGen"
              type="button"
              onClick={() => {
                handleClose();
                requestImageGen(
                  editor.state.doc
                    .textBetween(
                      editor.state.selection.from,
                      editor.state.selection.to,
                      '\n'
                    )
                    .trim() || undefined
                );
              }}
              className={cn(
                'mt-1 flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-ui transition-colors duration-150 ease-craft',
                'text-foreground/85 hover:bg-foreground/4'
              )}
            >
              <ImageIcon className="size-3.5 text-muted-foreground" />
              生成图像
            </button>
            {error && <p className="px-1 pt-1.5 text-meta text-destructive">{error}</p>}
          </>
        ) : (
          <div>
            <div className="max-h-32 overflow-y-auto rounded-md bg-foreground/4 px-2 py-1.5 text-meta leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
            <div className="mt-1.5 flex items-center gap-1">
              {pendingReplace && (
                <button
                  type="button"
                  onClick={() => applyResult('replace')}
                  className="flex-1 rounded-lg bg-craft-accent px-2 py-1 text-ui text-white transition-colors duration-150 ease-craft hover:bg-craft-accent-hover"
                >
                  替换选区
                </button>
              )}
              <button
                type="button"
                onClick={() => applyResult('insert-below')}
                className={cn(
                  'rounded-lg px-2 py-1 text-ui transition-colors duration-150 ease-craft',
                  pendingReplace
                    ? 'flex-1 border border-foreground/10 text-foreground/85 hover:bg-foreground/4'
                    : 'flex-1 bg-craft-accent text-white hover:bg-craft-accent-hover'
                )}
              >
                插入到下方
              </button>
              <button
                type="button"
                onClick={handleClose}
                aria-label="取消"
                className="flex size-6 items-center justify-center rounded-md text-foreground/40 transition-colors duration-150 ease-craft hover:bg-foreground/4 hover:text-foreground/85"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </TiptapBubbleMenu>
  );
}
