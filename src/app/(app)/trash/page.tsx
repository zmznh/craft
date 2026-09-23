import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getDeletedDocuments } from '@/actions/document/get';
import { TrashList } from '@/components/document/TrashList';

export default async function TrashPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const deletedDocs = await getDeletedDocuments();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        <h1 className="mb-6 text-2xl font-semibold">回收站</h1>
        <TrashList documents={deletedDocs} />
      </div>
    </div>
  );
}
