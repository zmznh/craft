'use client';

import { TableView } from './TableView';
import { KanbanView } from './KanbanView';
import { CalendarView } from './CalendarView';
import { ListView } from './ListView';
import { GalleryView } from './GalleryView';
import { FormView } from './FormView';
import type { getCollection } from '@/actions/collection/collection';

type Collection = Awaited<ReturnType<typeof getCollection>>;
type View = NonNullable<Collection>['views'][number];

interface CollectionViewProps {
  collection: NonNullable<Collection>;
  activeView: View;
}

export function CollectionView({ collection, activeView }: CollectionViewProps) {
  switch (activeView.type) {
    case 'table':
      return <TableView collection={collection} view={activeView} />;
    case 'kanban':
      return <KanbanView collection={collection} view={activeView} />;
    case 'calendar':
      return <CalendarView collection={collection} view={activeView} />;
    case 'list':
      return <ListView collection={collection} view={activeView} />;
    case 'gallery':
      return <GalleryView collection={collection} view={activeView} />;
    case 'form':
      return <FormView collection={collection} view={activeView} />;
    default:
      return <div className="flex flex-1 items-center justify-center text-muted-foreground">未知视图类型</div>;
  }
}
