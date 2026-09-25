import { redirect } from 'next/navigation';
import { ViewTransition } from 'react';
import { auth } from '@/lib/auth/auth';
import { getWhiteboards } from '@/actions/whiteboard/whiteboard';
import { CreateWhiteboardButton } from './CreateWhiteboardButton';

export default async function WhiteboardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const boards = await getWhiteboards();

  return (
    <ViewTransition>
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-title font-semibold">白板</h1>
          <CreateWhiteboardButton />
        </div>

        {boards.length === 0 ? (
          <div className="flex h-[180px] items-center justify-center rounded-[15px] bg-foreground/[0.03]">
            <p className="text-ui font-medium text-foreground/40">
              还没有白板，点击右上角按钮创建第一个
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <a
                key={board.id}
                href={`/whiteboards/${board.id}`}
                className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors duration-150 hover:bg-foreground/[0.03] hover:shadow-md"
              >
                <div className="flex items-start gap-2">
                  <span className="text-2xl leading-none">{board.icon ?? '🎨'}</span>
                  <h3 className="flex-1 truncate text-body font-medium">{board.name}</h3>
                </div>
                <p className="text-meta text-foreground/40">
                  {new Date(board.updatedAt).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
    </ViewTransition>
  );
}
