'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  createMetadataSync,
  readStoredCursor,
  writeStoredCursor,
} from '@/lib/sync/client';
import { useMetadataSyncStore } from '@/lib/store/use-sync-store';
import { useSidebarStore } from '@/lib/store/use-sidebar-store';

/** Tables the sidebar trees render — a change here means "reload the trees". */
const SIDEBAR_TABLES = new Set(['Document', 'Folder', 'Collection', 'Whiteboard']);

/**
 * Runs the metadata poller for the signed-in session. Mounted inside the app
 * shell (`src/app/(app)/layout.tsx`) rather than the root layout: the login and
 * public share routes must not poll, and `useSession` needs `SessionProvider`
 * above it, which the root layout provides.
 *
 * Rendering nothing is intentional — this is a lifecycle component.
 */
export function MetadataSyncProvider() {
  const { data: session, status } = useSession();
  const userId = status === 'authenticated' ? session?.user?.id ?? null : null;

  useEffect(() => {
    if (!userId) return;

    // A reload resumes from the persisted cursor; a first-ever run has none and
    // therefore pulls the whole workspace.
    useMetadataSyncStore.getState().reset();
    useMetadataSyncStore.setState({ cursor: readStoredCursor(userId) });

    const sync = createMetadataSync({
      getCursor: () => useMetadataSyncStore.getState().cursor,
      setCursor: (cursor) => {
        writeStoredCursor(userId, cursor);
        useMetadataSyncStore.setState({ cursor });
      },
      onPayload: (payload) => {
        const { changedTables } = useMetadataSyncStore.getState().applyPayload(payload);
        if (changedTables.some((table) => SIDEBAR_TABLES.has(table))) {
          // The trees read through server actions, so the signal they need is
          // "reload", not the row itself. bumpTree is the existing mechanism.
          useSidebarStore.getState().bumpTree();
        }
      },
      onStatus: (snapshot) => useMetadataSyncStore.getState().setStatus(snapshot),
    });

    sync.start();

    // Coming back to the tab, regaining the network, or focusing the window can
    // all leave us arbitrarily far behind — pull once right away instead of
    // waiting out the interval. Leaving the tab fires the same handler so the
    // cursor is fresh by the time the user returns.
    const wake = () => sync.syncNow();
    window.addEventListener('focus', wake);
    window.addEventListener('online', wake);
    document.addEventListener('visibilitychange', wake);

    return () => {
      window.removeEventListener('focus', wake);
      window.removeEventListener('online', wake);
      document.removeEventListener('visibilitychange', wake);
      sync.stop();
    };
  }, [userId]);

  return null;
}
