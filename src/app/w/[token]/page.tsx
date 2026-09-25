import Link from 'next/link';
import { auth } from '@/lib/auth/auth';
import { resolveWhiteboardShareToken } from '@/actions/whiteboard/share';
import { Board } from '@/components/whiteboard/Board';

interface SharedWhiteboardPageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedWhiteboardPage({ params }: SharedWhiteboardPageProps) {
  const { token } = await params;
  const board = await resolveWhiteboardShareToken(token);

  if (!board) {
    return (
      <main className="flex h-dvh flex-col items-center justify-center gap-3">
        <p className="text-lg">链接无效或已关闭分享</p>
        <Link href="/login" className="text-sm text-muted-foreground underline">
          回到登录页
        </Link>
      </main>
    );
  }

  const session = await auth();

  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-base leading-none">{board.icon ?? '🎨'}</span>
          <span className="truncate font-medium">{board.name}</span>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            {board.permission === 'edit' && session ? '可编辑' : '只读查看'}
          </span>
        </div>
        {board.permission === 'edit' && !session && (
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/w/${token}`)}`}
            className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            登录后可编辑
          </Link>
        )}
      </div>
      <div className="min-h-0 flex-1">
        <Board whiteboardId={board.id} shareToken={token} />
      </div>
    </main>
  );
}
