import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getWhiteboard } from '@/actions/whiteboard/whiteboard';
import { Board } from '@/components/whiteboard/Board';
import { WhiteboardBreadcrumb } from './WhiteboardBreadcrumb';
import { WhiteboardShareButton } from './WhiteboardShareButton';

interface WhiteboardPageProps {
  params: Promise<{ id: string }>;
}

export default async function WhiteboardPage({ params }: WhiteboardPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { id } = await params;
  const board = await getWhiteboard(id);

  if (!board) redirect('/whiteboards');

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <div className="flex h-12 shrink-0 items-center justify-between gap-3 px-4">
        <div className="min-w-0 flex-1">
          <WhiteboardBreadcrumb id={board.id} name={board.name} icon={board.icon} />
        </div>
        <WhiteboardShareButton whiteboardId={board.id} />
      </div>
      <div className="min-h-0 flex-1">
        <Board whiteboardId={board.id} />
      </div>
    </div>
  );
}
