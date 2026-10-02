import { Sidebar } from '@/components/sidebar/Sidebar';
import { CommandPalette } from '@/components/search/CommandPalette';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { AppShellHeader } from '@/components/app/AppPageHeader';
import { MetadataSyncProvider } from '@/components/providers/MetadataSyncProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Polls /api/sync/changes for the signed-in session; renders nothing. */}
      <MetadataSyncProvider />
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <AppShellHeader />
        {children}
      </main>
      <CommandPalette />
      <SettingsModal />
    </div>
  );
}
