'use client';

import { useSyncExternalStore } from 'react';

export const MOBILE_QUERY = '(max-width: 767px)';
export const COMPACT_QUERY = '(max-width: 1023px)';

interface Store {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => boolean;
  getServerSnapshot: () => boolean;
}

const stores = new Map<string, Store>();

// One cached store per query keeps the function identities stable, which is what
// useSyncExternalStore compares on every render.
function storeFor(query: string): Store {
  let store = stores.get(query);
  if (!store) {
    store = {
      subscribe: (onChange) => {
        const list = window.matchMedia(query);
        list.addEventListener('change', onChange);
        return () => list.removeEventListener('change', onChange);
      },
      getSnapshot: () => window.matchMedia(query).matches,
      getServerSnapshot: () => false,
    };
    stores.set(query, store);
  }
  return store;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    storeFor(query).subscribe,
    storeFor(query).getSnapshot,
    storeFor(query).getServerSnapshot,
  );
}

/** Phones get the drawer + bottom-sheet shell. */
export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY);
}

/** Tablets and below: side panels no longer fit next to the editor. */
export function useIsCompact(): boolean {
  return useMediaQuery(COMPACT_QUERY);
}
