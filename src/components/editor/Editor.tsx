'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor as TiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { common, createLowlight } from 'lowlight';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { updateDocument } from '@/actions/document/update';
import { uploadFile } from '@/lib/upload-client';
import { syncBacklinks } from '@/actions/document/backlinks';
import { syncDocumentTasks } from '@/actions/task/task';
import { pmNodeText } from '@/lib/search/extract';
import { EditorBubbleMenu } from './bubble-menu/BubbleMenu';
import { AiBubbleMenu } from './bubble-menu/AiBubbleMenu';
import { ImageGenDialogHost } from './ai/ImageGenDialog';
import { TableToolbar } from './table/TableToolbar';
import { DragHandle } from './drag-handle/DragHandle';
import { SlashCommand } from './slash-menu/SlashCommandExtension';
import { slashCommands } from './slash-menu/slash-commands';
import { MarkdownShortcuts } from './extensions/markdown-shortcuts';
import { Callout } from './extensions/callout';
import { ToggleBlock } from './extensions/toggle-block';
import { GradientHighlight } from './extensions/gradient-highlight';
import { FocusStyle } from './extensions/focus-style';
import { ShadedStyle } from './extensions/shaded-style';
import { ImageBlock } from './extensions/image-block';
import { Attachment } from './extensions/attachment';
import { LinkPreview } from './extensions/link-preview';
import { ImageGallery } from './extensions/image-gallery';
import { Drawing } from './extensions/drawing';
import { VideoEmbed } from './extensions/video-embed';
import { Divider } from './extensions/divider';
import { MathBlock } from './extensions/math-block';
import { InlineMath } from './extensions/math-inline';
import { Mention } from './extensions/mention';
import { BlockLink } from './extensions/block-link';
import { BlockLinkSuggestion } from './extensions/block-link-suggestion';
import { WhiteboardLink } from './extensions/whiteboard-link';
import { SidebarDrop } from './extensions/sidebar-drop';
import { CardBlock } from './extensions/card-block';
import { CommentMark } from './extensions/comment-mark';
import { saveDraft, getDraft, deleteDraft } from '@/lib/offline/draft-store';
import { useCollabSession } from '@/lib/collaboration/use-collab-session';
import Collaboration from '@tiptap/extension-collaboration';

const lowlight = createLowlight(common);

function collectLinkedDocIds(content: unknown): string[] {
  const ids = new Set<string>();
  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (
      (node.type === 'mention' || node.type === 'blockLink') &&
      typeof node.attrs?.documentId === 'string'
    ) {
      ids.add(node.attrs.documentId);
    }
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  if (content && typeof content === 'object' && 'type' in (content as object)) {
    walk(content);
  }
  return [...ids];
}

function collectTaskItems(content: unknown): { taskId: string; title: string; isCompleted: boolean }[] {
  const tasks: { taskId: string; title: string; isCompleted: boolean }[] = [];
  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'taskItem' && Array.isArray(node.content)) {
      const title = node.content.map(pmNodeText).join(' ').trim();
      if (title) {
        const taskId = typeof node.attrs?.taskId === 'string' && node.attrs.taskId
          ? node.attrs.taskId
          : crypto.randomUUID();
        node.attrs = { ...node.attrs, taskId };
        tasks.push({ taskId, title, isCompleted: !!node.attrs.checked });
      }
    }
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  if (content && typeof content === 'object' && 'type' in (content as object)) {
    walk(content);
  }
  return tasks;
}

export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface EditorProps {
  documentId: string;
  initialContent?: any;
  readOnly?: boolean;
  collaborative?: boolean;
  onUpdate?: (content: any, plainText: string, wordCount: number) => void;
  onEditorReady?: (editor: TiptapEditor | null) => void;
  onSaveStateChange?: (state: SaveState) => void;
  onSaveNowReady?: (saveNow: (() => void) | null) => void;
}

export function Editor({
  documentId,
  initialContent,
  readOnly = false,
  collaborative = false,
  onUpdate,
  onEditorReady,
  onSaveStateChange,
  onSaveNowReady,
}: EditorProps) {
  const [initialYdoc] = useState<Y.Doc | null>(() => (collaborative ? new Y.Doc() : null));
  const { ydoc: collabDoc, state: collabState } = useCollabSession(documentId, initialYdoc, collaborative);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRef = useRef<{
    content: unknown;
    plainText: string;
    wordCount: number;
    contentStr: string;
    revision: number;
  } | null>(null);
  const lastSavedRef = useRef<string>('');
  const revisionRef = useRef(0);
  const savingRef = useRef(false);

  const setSaveState = useCallback((state: SaveState) => {
    onSaveStateChange?.(state);
  }, [onSaveStateChange]);

  const savePending = async () => {
    const pending = pendingRef.current;
    if (!pending || savingRef.current || pending.contentStr === lastSavedRef.current) return;

    savingRef.current = true;
    setSaveState('saving');
    try {
      await updateDocument(documentId, {
        content: pending.content,
        plainText: pending.plainText,
        wordCount: pending.wordCount,
      });
      if (pending.revision >= revisionRef.current) {
        lastSavedRef.current = pending.contentStr;
        pendingRef.current = null;
        setSaveState('saved');
        onUpdate?.(pending.content, pending.plainText, pending.wordCount);
        void deleteDraft(documentId).catch(() => {});
      }
      try {
        await syncBacklinks(documentId, collectLinkedDocIds(pending.content));
      } catch {
        // backlink sync must never block saving
      }
      try {
        await syncDocumentTasks(documentId, collectTaskItems(pending.content));
      } catch {
        // task sync must never block saving
      }
    } catch {
      setSaveState('error');
      if (pending) {
        void saveDraft({
          documentId,
          content: pending.content,
          plainText: pending.plainText,
          wordCount: pending.wordCount,
          contentStr: pending.contentStr,
          savedAt: Date.now(),
        }).catch(() => {});
      }
    } finally {
      savingRef.current = false;
      if (pendingRef.current && pendingRef.current.revision > (pending?.revision ?? 0)) {
        queueMicrotask(() => void savePending());
      }
    }
  };

  const scheduleSave = (delay = 2000) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      void savePending();
    }, delay);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-craft-accent underline-offset-4 hover:underline',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            taskId: {
              default: null,
              parseHTML: (element) => element.getAttribute('data-task-id'),
              renderHTML: (attributes) => attributes.taskId
                ? { 'data-task-id': attributes.taskId }
                : {},
            },
          };
        },
      }).configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-list-item',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: '输入 / 使用命令...',
      }),
      CharacterCount,
      Typography,
      Dropcursor.configure({
        width: 2,
        class: 'ProseMirror-dropcursor',
      }),
      Gapcursor,
      TextStyle,
      Color,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            backgroundColor: {
              default: null,
              parseHTML: (element) =>
                element.style.backgroundColor || null,
              renderHTML: (attributes) => {
                if (!attributes.backgroundColor) return {};
                return { style: `background-color: ${attributes.backgroundColor}` };
              },
            },
            color: {
              default: null,
              parseHTML: (element) => element.style.color || null,
              renderHTML: (attributes) => {
                if (!attributes.color) return {};
                return { style: `color: ${attributes.color}` };
              },
            },
          };
        },
      }),
      TableHeader,
      Callout,
      ToggleBlock,
      GradientHighlight,
      FocusStyle,
      ShadedStyle,
      ImageBlock,
      Attachment,
      LinkPreview,
      ImageGallery,
      Drawing,
      VideoEmbed,
      Divider,
      MathBlock,
      InlineMath,
      Mention,
      BlockLink,
      BlockLinkSuggestion,
      WhiteboardLink,
      SidebarDrop,
      CardBlock,
      MarkdownShortcuts,
      SlashCommand,
      CommentMark.configure({
        HTMLAttributes: {
          class: 'comment-mark',
        },
      }),
      ...(collabDoc
        ? [Collaboration.configure({ document: collabDoc, field: 'default' })]
        : []),
    ],
    content: collaborative ? '' : initialContent || '',
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
      handlePaste: (view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) =>
          f.type.startsWith('image/')
        );
        if (files.length === 0) {
          const text = event.clipboardData?.getData('text/plain')?.trim() ?? '';
          const { from, to, empty } = view.state.selection;
          if (
            empty &&
            view.state.schema.nodes.linkPreview &&
            /^https?:\/\/\S+$/.test(text)
          ) {
            event.preventDefault();
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.linkPreview.create({ url: text })
              )
            );
            return true;
          }
          return false;
        }
        event.preventDefault();
        void (async () => {
          for (const file of files) {
            try {
              const { url } = await uploadFile(file);
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.imageBlock.create({
                    src: url,
                    alt: file.name,
                  })
                )
              );
            } catch {
              // upload failure: skip this image
            }
          }
        })();
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      if (readOnly) return;
      const rawContent = editor.getJSON();
      const content = JSON.parse(JSON.stringify(rawContent));
      const plainText = editor.getText();
      const wordCount = editor.storage.characterCount.characters();
      const contentStr = JSON.stringify(content);
      revisionRef.current += 1;
      pendingRef.current = {
        content,
        plainText,
        wordCount,
        contentStr,
        revision: revisionRef.current,
      };
      setSaveState('dirty');
      scheduleSave();
    },
  });

  useEffect(() => {
    if (editor) onEditorReady?.(editor);
    return () => {
      onEditorReady?.(null);
    };
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor || readOnly) return;
    if (collaborative && collabState === 'synced' && collabDoc && initialContent) {
      const fragment = collabDoc.getXmlFragment('default');
      if (fragment.length === 0 && editor.isEmpty) {
        editor.commands.setContent(initialContent as never);
      }
      return;
    }
    if (collaborative) return;
    let cancelled = false;
    void getDraft(documentId)
      .then(async (draft) => {
        if (cancelled || !draft) return;
        if (JSON.stringify(editor.getJSON()) === draft.contentStr) {
          await deleteDraft(documentId).catch(() => {});
          return;
        }
        editor.commands.setContent(draft.content as never);
        setSaveState('dirty');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [editor, readOnly, documentId, setSaveState, collaborative, collabState, collabDoc, initialContent]);

  useEffect(() => {
    if (editor && !readOnly) onSaveNowReady?.(() => void savePending());
    return () => onSaveNowReady?.(null);
  }, [editor, onSaveNowReady, readOnly]);

  useEffect(() => {
    if (!editor || readOnly) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        void savePending();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, readOnly, savePending]);

  useEffect(() => {
    // DOM-level intercept for slash-command drag-and-drop.
    // PM processes the drop first (inserting text/plain as fallback), then our command overwrites it.
    if (!editor) return;
    const dom = editor.view.dom;

    let pendingSlash: { name: string } | null = null;

    const onDragOver = (e: Event) => {
      const dt = (e as DragEvent).dataTransfer;
      if (!dt || !dt.types.includes('application/x-crafty-slash-command')) return;
      e.preventDefault();
      dt.dropEffect = 'copy';
    };

    const onDragStart = (e: Event) => {
      const dt = (e as DragEvent).dataTransfer;
      if (!dt) return;
      const raw = dt.getData('application/x-crafty-slash-command');
      if (!raw) return;
      try { pendingSlash = JSON.parse(raw); } catch { pendingSlash = null; }
    };

    const onDrop = (e: Event) => {
      if (!pendingSlash) return;
      const cmd = slashCommands.find((c) => c.name === pendingSlash!.name);
      pendingSlash = null;
      if (!cmd) return;

      // Let PM finish processing the drop first, then run our command.
      // PM may insert text/plain; our command replaces it with the correct block.
      requestAnimationFrame(() => {
        try {
          const { from, to } = editor.state.selection;
          const range = from === to ? { from, to: from } : { from, to };
          cmd.command(editor, range);
        } catch {}
      });
    };

    window.addEventListener('dragover', onDragOver, true);
    window.addEventListener('dragstart', onDragStart, true);
    dom.addEventListener('drop', onDrop);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      window.removeEventListener('dragover', onDragOver, true);
      window.removeEventListener('dragstart', onDragStart, true);
      dom.removeEventListener('drop', onDrop);
    };
  }, [editor]);

  if (!editor) return null;

  if (readOnly) {
    return (
      <div className="relative">
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className="relative">
      <DragHandle editor={editor} />
      <EditorBubbleMenu editor={editor} />
      <AiBubbleMenu editor={editor} />
      <TableToolbar editor={editor} />
      <EditorContent editor={editor} />
      <ImageGenDialogHost editor={editor} />
    </div>
  );
}
