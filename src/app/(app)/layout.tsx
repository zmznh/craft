import { Sidebar } from '@/components/sidebar/Sidebar';
import { CommandPalette } from '@/components/search/CommandPalette';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
