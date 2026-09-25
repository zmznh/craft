'use client';

import { useSidebarStore } from '@/lib/store/use-sidebar-store';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import { SidebarFooter } from './SidebarFooter';
import { SidebarResizer } from './SidebarResizer';
import { SidebarSection } from './SidebarSection';
import { FolderTree } from './FolderTree';
import { DocumentTree } from './DocumentTree';
import { CollectionTree } from './CollectionTree';
import { WhiteboardTree } from './WhiteboardTree';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from 'cn';

function SidebarBody() {
  return (
    <>
      <SidebarHeader />
      <SidebarNav />

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5">
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
  const { isOpen, width, setOpen } = useSidebarStore();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => setOpen(open)}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[288px] max-w-[85vw] gap-0 overflow-hidden border-r border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <SidebarBody />
      </SheetContent>
    </Sheet>
    );
  }

  return (
    <>
      <aside
        className={cn(
          'relative flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 [transition-timing-function:var(--ease-craft)]',
          isOpen ? 'opacity-100' : 'w-0 opacity-0 overflow-hidden border-r-0'
        )}
        style={{ width: isOpen ? width : 0 }}
      >
        <SidebarBody />
      </aside>
      {isOpen && <SidebarResizer />}
    </>
  );
}
