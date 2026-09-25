import { redirect } from 'next/navigation';
import { ViewTransition } from 'react';
import { auth } from '@/lib/auth/auth';
import { getDeletedDocuments } from '@/actions/document/get';
import { TrashList } from '@/components/document/TrashList';

export default async function TrashPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const deletedDocs = await getDeletedDocuments();

  return (
    <ViewTransition>
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-4 pb-8">
        <h1 className="mb-5 text-title font-semibold">回收站</h1>
        <TrashList documents={deletedDocs} />
      </div>
    </div>
    </ViewTransition>
  );
}
