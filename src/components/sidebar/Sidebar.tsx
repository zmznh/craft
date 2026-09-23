'use client';

import { useSidebarStore } from '@/lib/store/use-sidebar-store';
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

export function Sidebar() {
  const { isOpen, width } = useSidebarStore();

  return (
    <>
      <aside
        className={cn(
          'relative flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200',
          isOpen ? 'opacity-100' : 'w-0 opacity-0 overflow-hidden border-r-0'
        )}
        style={{ width: isOpen ? width : 0 }}
      >
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
      </aside>
      {isOpen && <SidebarResizer />}
    </>
  );
}
