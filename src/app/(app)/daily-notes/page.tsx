import { redirect } from 'next/navigation';
import { ViewTransition } from 'react';
import { auth } from '@/lib/auth/auth';
import { getDailyNotes } from '@/actions/daily-notes/daily-notes';
import type { DailyNoteItem } from '@/actions/daily-notes/daily-notes';
import { TodayNoteButton } from './TodayNoteButton';
import { DailyNotesList } from './DailyNotesList';

export default async function DailyNotesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const notes = await getDailyNotes();

  const today = startOfDay(new Date()).getTime();
  const yesterday = today - 24 * 60 * 60 * 1000;
  const weekAgo = today - 6 * 24 * 60 * 60 * 1000;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartTime = monthStart.getTime() > yesterday ? yesterday : monthStart.getTime();

  const groups: { label: string; notes: DailyNoteItem[] }[] = [
    { label: '今天', notes: [] },
    { label: '昨天', notes: [] },
    { label: '7 天内', notes: [] },
    { label: '本月早些时候', notes: [] },
    { label: '更早', notes: [] },
  ];

  for (const note of notes) {
    const t = note.dailyNoteDate ? new Date(note.dailyNoteDate).getTime() : 0;
    const dayStart = startOfDay(new Date(t)).getTime();
    if (dayStart >= today) groups[0].notes.push(note);
    else if (dayStart >= yesterday) groups[1].notes.push(note);
    else if (dayStart >= weekAgo) groups[2].notes.push(note);
    else if (dayStart >= monthStartTime) groups[3].notes.push(note);
    else groups[4].notes.push(note);
  }

  return (
    <ViewTransition>
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-4 pb-8">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-title font-semibold">日记</h1>
          <TodayNoteButton />
        </div>

        {notes.length === 0 ? (
          <div className="flex min-h-[180px] items-center justify-center rounded-[15px] bg-foreground/[0.03] px-6 text-center">
            <p className="text-ui font-medium text-foreground/40">
              还没有日记，点击右上角按钮开始今天的第一篇
            </p>
          </div>
        ) : (
          <DailyNotesList groups={groups} />
        )}
      </div>
    </div>
    </ViewTransition>
  );
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
