import { Sidebar } from '@/components/sidebar/Sidebar';
import { CommandPalette } from '@/components/search/CommandPalette';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { AppShellHeader } from '@/components/app/AppPageHeader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
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
