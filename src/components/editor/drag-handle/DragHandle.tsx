'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import type { Editor } from '@tiptap/react';
import { GripVertical } from 'lucide-react';
import { dropTargetFor } from './drop-band';

interface HandlePosition {
  top: number;
  left: number;
  blockEl: HTMLElement;
}

interface IndicatorPosition {
  top: number;
  visible: boolean;
}

interface DragRange {
  from: number;
  to: number;
  els: HTMLElement[];
}

const HANDLE_OFFSET = -26;

export function DragHandle({ editor }: { editor: Editor }) {
  const [handle, setHandle] = useState<HandlePosition | null>(null);
  const [indicator, setIndicator] = useState<IndicatorPosition>({ top: 0, visible: false });
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    pointerId: number;
    range: DragRange | null;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * `posAtDOM(el, 0)` resolves to depth 0 for the first top-level block, which used to
   * make the very first block undraggable. Walking the document by child index keeps
   * the range correct for every block.
   */
  const getTopLevelRange = useCallback(
    (el: HTMLElement): { from: number; to: number } | null => {
      const view = editor.view;
      const index = Array.prototype.indexOf.call(view.dom.children, el);
      if (index < 0) return null;

      let pos = 0;
      for (let child = 0; child < view.state.doc.childCount; child += 1) {
        const node = view.state.doc.child(child);
        if (child === index) return { from: pos, to: pos + node.nodeSize };
        pos += node.nodeSize;
      }
      return null;
    },
    [editor]
  );

  const updateHandlePosition = useCallback((blockEl: HTMLElement) => {
    const editorRect = editor.view.dom.getBoundingClientRect();
    const blockRect = blockEl.getBoundingClientRect();
    setHandle({
      top: blockRect.top - editorRect.top,
      left: HANDLE_OFFSET,
      blockEl,
    });
  }, [editor]);

  useEffect(() => {
    const dom = editor.view.dom;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragStateRef.current) return;
      const target = e.target as HTMLElement;
      const block = target.closest('.ProseMirror > *');
      const editorRect = dom.getBoundingClientRect();

      if (block && block instanceof HTMLElement && e.clientX < editorRect.left + 64) {
        updateHandlePosition(block);
      } else {
        setHandle(null);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // The handle renders in the gutter, outside the editor's own box, so the pointer
      // has to leave `dom` to reach it. Without this guard it hides the moment you
      // move onto it and the block can never be dragged.
      const to = e.relatedTarget as HTMLElement | null;
      if (to?.closest?.('[data-drag-handle]')) return;
      if (!dragStateRef.current) setHandle(null);
    };

    dom.addEventListener('mousemove', handleMouseMove);
    dom.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      dom.removeEventListener('mousemove', handleMouseMove);
      dom.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [editor, updateHandlePosition]);

  const selectBlock = useCallback(
    (blockEl: HTMLElement, extend: boolean) => {
      const range = getTopLevelRange(blockEl);
      if (!range) return;
      const { state, view } = editor;
      const $from = state.doc.resolve(range.from);
      const $to = state.doc.resolve(range.to);

      if (extend) {
        const anchor = state.selection.from;
        const selection =
          range.from >= anchor
            ? TextSelection.create(state.doc, anchor, range.to)
            : TextSelection.create(state.doc, range.from, anchor);
        view.dispatch(state.tr.setSelection(selection).scrollIntoView());
      } else {
        view.dispatch(state.tr.setSelection(NodeSelection.create(state.doc, range.from)));
      }
      view.focus();
    },
    [editor, getTopLevelRange]
  );

  const computeDropTarget = useCallback(
    (clientY: number): { el: HTMLElement; pos: number; before: boolean } | null => {
      const dom = editor.view.dom as HTMLElement;
      const children = Array.from(dom.children) as HTMLElement[];
      const rows = children.map((child) => {
        const rect = child.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom };
      });
      const slot = dropTargetFor(clientY, rows);
      if (!slot) return null;
      const child = children[slot.index];
      const range = getTopLevelRange(child);
      if (!range) return null;
      return {
        el: child,
        pos: slot.before ? range.from : range.to,
        before: slot.before,
      };
    },
    [editor, getTopLevelRange]
  );

  const performMove = useCallback(
    (range: DragRange, target: { pos: number; before: boolean }) => {
      const { state, view } = editor;
      const { from, to } = range;

      if (target.pos >= from && target.pos <= to) return;

      const slice = state.doc.slice(from, to);
      let insertPos = target.pos;
      if (insertPos > to) {
        insertPos = target.pos - (to - from);
      }

      const tr = state.tr;
      tr.delete(from, to);
      tr.insert(insertPos, slice.content);
      const $new = tr.doc.resolve(Math.min(insertPos + 1, tr.doc.content.size));
      tr.setSelection(TextSelection.near($new));
      view.dispatch(tr);
      view.focus();
    },
    [editor]
  );

  const onHandlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!handle) return;
      e.preventDefault();

      // ProseMirror replaces block elements whenever the Yjs echo or the autosave
      // transaction lands, so the element captured at hover time can already be
      // detached by the time the pointer goes down. Re-resolve it from the handle's
      // own offset, or the drag silently refuses to arm.
      const dom = editor.view.dom as HTMLElement;
      const wantedTop = dom.getBoundingClientRect().top + handle.top;
      const blockEl = (Array.from(dom.children) as HTMLElement[]).find((child) => {
        const rect = child.getBoundingClientRect();
        return rect.top <= wantedTop && rect.bottom >= wantedTop;
      });
      if (!blockEl) return;

      dragStateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        pointerId: e.pointerId,
        range: null,
      };

      const resolveDragRange = (): DragRange | null => {
        const base = getTopLevelRange(blockEl);
        if (!base) return null;

        const { state } = editor;
        const selection = state.selection;
        const isMultiSelection =
          selection.from !== selection.to &&
          selection.from <= base.to &&
          selection.to >= base.from;

        if (isMultiSelection) {
          const from = Math.min(selection.from, selection.to);
          const to = Math.max(selection.from, selection.to);
          const dom = editor.view.dom as HTMLElement;
          const els: HTMLElement[] = [];
          for (const child of Array.from(dom.children) as HTMLElement[]) {
            const childRange = getTopLevelRange(child);
            if (childRange && childRange.from >= from && childRange.to <= to) {
              els.push(child);
            }
          }
          return { from, to, els };
        }

        return { ...base, els: [blockEl] };
      };

      const handlePointerMove = (ev: PointerEvent) => {
        const st = dragStateRef.current;
        if (!st) return;
        if (!st.range) {
          const dist = Math.hypot(ev.clientX - st.startX, ev.clientY - st.startY);
          if (dist < 4) return;
          st.range = resolveDragRange();
        }
        if (!st.range) return;
        setIsDragging(true);
        st.range.els.forEach((el) => el.classList.add('opacity-40'));

        const target = computeDropTarget(ev.clientY);
        if (target) {
          const editorRect = editor.view.dom.getBoundingClientRect();
          const targetRect = target.el.getBoundingClientRect();
          setIndicator({
            top: target.before
              ? targetRect.top - editorRect.top
              : targetRect.bottom - editorRect.top,
            visible: true,
          });
        } else {
          setIndicator((prev) => ({ ...prev, visible: false }));
        }
      };

      const handlePointerUp = (ev: PointerEvent) => {
        const st = dragStateRef.current;
        dragStateRef.current = null;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);

        setIndicator((prev) => ({ ...prev, visible: false }));
        setIsDragging(false);

        if (!st?.range) {
          selectBlock(blockEl, ev.shiftKey);
          return;
        }

        st.range.els.forEach((el) => el.classList.remove('opacity-40'));
        const target = computeDropTarget(ev.clientY);
        if (target) {
          performMove(st.range, target);
        }
        setHandle(null);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [handle, editor, getTopLevelRange, computeDropTarget, performMove, selectBlock]
  );

  if (!handle && !isDragging) return null;

  return (
    <>
      {handle && (
        <div
          className="absolute z-50 flex cursor-grab items-center text-muted-foreground/50 transition-colors hover:text-foreground active:cursor-grabbing max-md:hidden"
          style={{
            top: handle.top,
            left: HANDLE_OFFSET,
            height: '24px',
          }}
          onPointerDown={onHandlePointerDown}
          data-drag-handle=""
        >
          <GripVertical className="size-4" />
        </div>
      )}
      {indicator.visible && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-40 h-0.5 rounded-full bg-primary/70"
          style={{ top: indicator.top - 1 }}
        >
          <div className="absolute -left-1 -top-[3px] size-2 rounded-full bg-primary/70" />
        </div>
      )}
    </>
  );
}
