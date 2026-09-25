'use client';

import { useSidebarStore } from '@/lib/store/use-sidebar-store';
import { useIsMobile } from '@/lib/use-is-mobile';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import { SidebarFooter } from './SidebarFooter';
import { SidebarResizer } from './SidebarResizer';
import { SidebarSection } from './SidebarSection';
import { FolderTree } from './FolderTree';
import { DocumentTree } from './DocumentTree';
import { CollectionTree } from './CollectionTree';
import { WhiteboardTree } from './WhiteboardTree';
import { cn } from 'cn';

function SidebarBody() {
  return (
    <>
      <SidebarHeader />
      <SidebarNav />

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-1">
        <SidebarSection title="文档">
          <DocumentTree />
        </SidebarSection>

        <SidebarSection title="文件夹">
          <FolderTree />
        </SidebarSection>

        <SidebarSection title="集合">
          <CollectionTree />
        </SidebarSection>

        <SidebarSection title="白板">
          <WhiteboardTree />
        </SidebarSection>
      </div>

      <SidebarFooter />
    </>
  );
}

export function Sidebar() {
  const { isOpen, width, mobileNavOpen, setMobileNavOpen } = useSidebarStore();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={mobileNavOpen} onOpenChange={(next) => (!next ? setMobileNavOpen(false) : undefined)}>
        <SheetContent
          side="left"
          className="w-[var(--layout-sidebar-w)] max-w-none gap-0 p-0"
          onClick={(event) => {
            // Picking a destination should dismiss the drawer, like Craft's app shell.
            if ((event.target as HTMLElement).closest('a')) setMobileNavOpen(false);
          }}
        >
          <SheetTitle className="sr-only">导航</SheetTitle>
          <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground" aria-label="导航侧栏">
            <SidebarBody />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <aside
        className={cn(
          'relative flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200',
          isOpen ? 'opacity-100' : 'w-0 opacity-0 overflow-hidden border-r-0'
        )}
        aria-label="导航侧栏"
        style={{ width: isOpen ? width : 0 }}
      >
        <SidebarBody />
      </aside>
      {isOpen && <SidebarResizer />}
    </>
  );
}
