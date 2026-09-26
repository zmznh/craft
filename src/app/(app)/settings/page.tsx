'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/lib/store/use-settings-store';

// Craft has no /settings route: settings live in a modal over the current page.
// This route only exists as a deep link that opens the modal.
export default function SettingsPage() {
  const router = useRouter();
  const openSettings = useSettingsStore((s) => s.openSettings);

  useEffect(() => {
    openSettings('space');
    return useSettingsStore.subscribe((state, prev) => {
      if (prev.open && !state.open) router.replace('/documents');
    });
  }, [openSettings, router]);

  return null;
}
