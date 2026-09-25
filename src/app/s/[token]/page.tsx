import { cookies } from 'next/headers';
import { getSharedDocument } from '@/actions/document/share';
import { SharedDocView } from '@/components/share/SharedDocView';
import { PublicDocBanner } from '@/components/share/PublicDocBanner';
import { PasscodeGate } from '@/components/share/PasscodeGate';
import { shareCookieName, verifyShareCookie } from '@/lib/share-passcode';
import { findShare } from '@/lib/share/resolve';

interface SharedPageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedPage({ params }: SharedPageProps) {
  const { token } = await params;
  const doc = await getSharedDocument(token);

  if (!doc) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">链接无效或文档已删除</p>
      </div>
    );
  }

  if (doc.passcodeProtected) {
    const share = await findShare(token);
    const passcode = (share as any)?.passcode ?? null;
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(shareCookieName(token))?.value;
    if (!verifyShareCookie(token, passcode, cookieValue)) {
      return (
        <PasscodeGate token={token} path={`/s/${token}`} title={doc.title} icon={doc.icon} />
      );
    }
  }

  return (
    <SharedDocView
      documentId={token}
      title={doc.title}
      icon={doc.icon}
      coverImage={doc.coverImage}
      coverType={doc.coverType}
      content={doc.content}
      header={<PublicDocBanner />}
    />
  );
}
