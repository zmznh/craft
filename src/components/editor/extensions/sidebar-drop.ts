import { Extension } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import {
  SIDEBAR_DOC_MIME,
  SIDEBAR_WHITEBOARD_MIME,
  parseSidebarDragPayload,
} from '@/lib/dnd/sidebar-drag';

interface SidebarDropState {
  pos: number | null;
}

function caretElement() {
  const el = document.createElement('span');
  el.className = 'crafty-sidebar-drop-caret';
  return el;
}

export const SidebarDrop = Extension.create({
  name: 'sidebarDrop',

  addProseMirrorPlugins() {
    const key = new PluginKey<SidebarDropState>('sidebarDrop');

    return [
      new Plugin<SidebarDropState>({
        key,
        state: {
          init: () => ({ pos: null }),
          apply: (tr, prev) => {
            const meta = tr.getMeta(key) as SidebarDropState | undefined;
            if (meta) return meta;
            return prev;
          },
        },
        props: {
          decorations(state) {
            const { pos } = key.getState(state) ?? { pos: null };
            if (pos === null) return DecorationSet.empty;
            return DecorationSet.create(state.doc, [
              Decoration.widget(pos, caretElement, { side: -1 }),
            ]);
          },
          handleDOMEvents: {
            dragover: (view, event) => {
              const dt = (event as DragEvent).dataTransfer;
              if (
                !dt ||
                (!dt.types.includes(SIDEBAR_DOC_MIME) &&
                  !dt.types.includes(SIDEBAR_WHITEBOARD_MIME))
              )
                return false;
              event.preventDefault();
              const coords = view.posAtCoords({
                left: (event as DragEvent).clientX,
                top: (event as DragEvent).clientY,
              });
              const pos = coords ? coords.pos : null;
              if ((key.getState(view.state) ?? { pos: null }).pos !== pos) {
                view.dispatch(view.state.tr.setMeta(key, { pos }));
              }
              return false;
            },
            dragleave: (view, event) => {
              const to = (event as DragEvent).relatedTarget as Node | null;
              if (to && view.dom.contains(to)) return false;
              if ((key.getState(view.state) ?? { pos: null }).pos !== null) {
                view.dispatch(view.state.tr.setMeta(key, { pos: null }));
              }
              return false;
            },
          },
          handleDrop: (view, event) => {
            const dragEvent = event as DragEvent;
            const dt = dragEvent.dataTransfer;
            if (!dt) return false;
            const payload =
              parseSidebarDragPayload(dt.getData(SIDEBAR_DOC_MIME)) ??
              parseSidebarDragPayload(dt.getData(SIDEBAR_WHITEBOARD_MIME));

            if (!payload) return false;

            const schema = view.state.schema;
            let node;
            if (payload.type === 'doc') {
              if (!schema.nodes.blockLink) return false;
              node = schema.nodes.blockLink.create({
                documentId: payload.documentId,
                title: payload.title,
              });
            } else if (payload.type === 'whiteboard') {
              const type = schema.nodes.whiteboardEmbed ?? schema.nodes.whiteboardLink;
              if (!type) return false;
              node = type.create({
                whiteboardId: payload.whiteboardId,
                title: payload.title,
                icon: payload.icon,
              });
            } else {
              return false;
            }
            event.preventDefault();

            const coords = view.posAtCoords({
              left: dragEvent.clientX,
              top: dragEvent.clientY,
            });
            const pos = coords ? coords.pos : view.state.selection.from;
            view.dispatch(
              view.state.tr
                .insert(pos, node)
                .setMeta(key, { pos: null })
            );
            view.focus();
            return true;
          },
        },
        view(editorView) {
          const clearCaret = () => {
            if ((key.getState(editorView.state) ?? { pos: null }).pos !== null) {
              editorView.dispatch(editorView.state.tr.setMeta(key, { pos: null }));
            }
          };
          window.addEventListener('dragend', clearCaret);
          window.addEventListener('drop', clearCaret);
          return {
            destroy() {
              window.removeEventListener('dragend', clearCaret);
              window.removeEventListener('drop', clearCaret);
            },
          };
        },
      }),
    ];
  },
});
