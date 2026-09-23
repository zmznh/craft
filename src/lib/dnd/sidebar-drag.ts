export const SIDEBAR_DOC_MIME = 'application/x-crafty-doc';
export const SIDEBAR_WHITEBOARD_MIME = 'application/x-crafty-whiteboard';
export const SIDEBAR_SLASH_COMMAND_MIME = 'application/x-crafty-slash-command';

export interface SidebarDocPayload {
  kind: 'sidebar-item';
  type: 'doc';
  documentId: string;
  title: string;
}

export interface SidebarFolderPayload {
  kind: 'sidebar-item';
  type: 'folder';
  folderId: string;
  title: string;
}

export interface SidebarWhiteboardPayload {
  kind: 'sidebar-item';
  type: 'whiteboard';
  whiteboardId: string;
  title: string;
  icon: string | null;
}

export interface SlashCommandPayload {
  kind: 'slash-command';
  name: string;
  category: string;
}

export type SidebarDragPayload =
  | SidebarDocPayload
  | SidebarFolderPayload
  | SidebarWhiteboardPayload;

export type SlashDragPayload = SlashCommandPayload;

// dataTransfer.getData is only readable in the drop event, so sidebar items
// stash the payload here for dragover-time decisions (drop zones, cycle guard)
export const sidebarDragState: { payload: SidebarDragPayload | SlashDragPayload | null } = {
  payload: null,
};

export function parseSidebarDragPayload(raw: string | null): SidebarDragPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.kind !== 'sidebar-item') return null;
    if (parsed.type === 'doc' && typeof parsed.documentId === 'string') {
      return parsed as SidebarDocPayload;
    }
    if (parsed.type === 'folder' && typeof parsed.folderId === 'string') {
      return parsed as SidebarFolderPayload;
    }
    if (parsed.type === 'whiteboard' && typeof parsed.whiteboardId === 'string') {
      return parsed as SidebarWhiteboardPayload;
    }
  } catch {
    return null;
  }
  return null;
}

export function parseSlashCommandPayload(raw: string | null): SlashDragPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.kind !== 'slash-command' || typeof parsed.name !== 'string') return null;
    return parsed as SlashDragPayload;
  } catch {
    return null;
  }
}
