import { cookies } from 'next/headers';
import { getSharedDocument } from '@/actions/document/share';
import { SharedDocView } from '@/components/share/SharedDocView';
import { PublicDocBanner } from '@/components/share/PublicDocBanner';
import { PasscodeGate } from '@/components/share/PasscodeGate';
import { shareCookieName, verifyShareCookie } from '@/lib/share-passcode';
import { getDb } from '@/prisma/db';

interface PublishPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublishPage({ params }: PublishPageProps) {
  const { slug } = await params;
  const doc = await getSharedDocument(slug);

  if (!doc || !doc.isPublished) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-ui text-foreground/40">页面不存在或未发布</p>
      </div>
    );
  }

  if (doc.passcodeProtected) {
    const db = await getDb();
    const share = await db.orm.public.DocumentShare.first({ token: slug });
    const passcode = (share as any)?.passcode ?? null;
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(shareCookieName(slug))?.value;
    if (!verifyShareCookie(slug, passcode, cookieValue)) {
      return (
        <PasscodeGate token={slug} path={`/p/${slug}`} title={doc.title} icon={doc.icon} />
      );
    }
  }

  return (
    <SharedDocView
      documentId={slug}
      title={doc.title}
      icon={doc.icon}
      coverImage={doc.coverImage}
      coverType={doc.coverType}
      content={doc.content}
      pageStyle={doc.pageStyle}
      styled
      header={<PublicDocBanner />}
    />
  );
}
