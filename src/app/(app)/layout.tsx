import { Sidebar } from '@/components/sidebar/Sidebar';
import { MobileTopBar } from '@/components/sidebar/MobileTopBar';
import { CommandPalette } from '@/components/search/CommandPalette';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileTopBar />
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
