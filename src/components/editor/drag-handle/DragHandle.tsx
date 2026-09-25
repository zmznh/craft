'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import type { Editor } from '@tiptap/react';
import { GripVertical } from 'lucide-react';

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

  const getTopLevelRange = useCallback(
    (el: HTMLElement): { from: number; to: number } | null => {
      const view = editor.view;
      const pos = view.posAtDOM(el, 0);
      const $pos = editor.state.doc.resolve(pos);
      if ($pos.depth < 1) return null;
      return { from: $pos.before(1), to: $pos.after(1) };
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

    const handleMouseLeave = () => {
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
      for (const child of children) {
        const rect = child.getBoundingClientRect();
        if (clientY >= rect.top && clientY <= rect.bottom) {
          const before = clientY < rect.top + rect.height / 2;
          const pos = editor.view.posAtDOM(child, 0);
          const $pos = editor.state.doc.resolve(pos);
          if ($pos.depth < 1) return null;
          return {
            el: child,
            pos: before ? $pos.before(1) : $pos.after(1),
            before,
          };
        }
      }
      return null;
    },
    [editor]
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
      dragStateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        pointerId: e.pointerId,
        range: null,
      };

      const blockEl = handle.blockEl;

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
          className="absolute z-50 flex cursor-grab items-center rounded-md px-0.5 text-foreground/40 transition-colors duration-150 ease-craft hover:bg-foreground/6 hover:text-foreground active:cursor-grabbing"
          style={{
            top: handle.top,
            left: HANDLE_OFFSET,
            height: '24px',
          }}
          onPointerDown={onHandlePointerDown}
          data-drag-handle=""
        >
          <GripVertical className="size-[18px]" />
        </div>
      )}
      {indicator.visible && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-40 h-0.5 rounded-full bg-craft-accent"
          style={{ top: indicator.top - 1 }}
        >
          <div className="absolute -left-1 -top-[3px] size-2 rounded-full bg-craft-accent" />
        </div>
      )}
    </>
  );
}
