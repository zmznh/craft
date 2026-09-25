import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getDocument } from '@/actions/document/get';
import { DocumentEditor } from '@/components/editor/DocumentEditor';

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { id } = await params;
  const doc = await getDocument(id);

  if (!doc) redirect('/documents');

  return <DocumentEditor document={doc} role={doc.role} />;
}
