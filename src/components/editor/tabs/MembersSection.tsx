'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import {
  addDocumentMember,
  listDocumentMembers,
  removeDocumentMember,
  updateDocumentMemberRole,
  type MemberRole,
} from '@/actions/document/members';

interface MemberRow {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  role: MemberRole;
}

const ROLE_LABELS: Record<MemberRole, string> = {
  editor: '可编辑',
  commenter: '可评论',
  viewer: '只读',
};

const ROLES = Object.keys(ROLE_LABELS) as MemberRole[];

interface MembersSectionProps {
  documentId: string;
  /** Only the document owner may grant or revoke access. */
  canManage: boolean;
}

export function MembersSection({ documentId, canManage }: MembersSectionProps) {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('editor');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      setMembers(await listDocumentMembers(documentId));
    } catch {
      setMembers([]);
    }
  }, [documentId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const message = (err: unknown, fallback: string) =>
    setError(err instanceof Error ? err.message : fallback);

  const handleAdd = async () => {
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await addDocumentMember({ documentId, email, role });
      setEmail('');
      await reload();
    } catch (err) {
      message(err, '添加协作者失败');
    } finally {
      setBusy(false);
    }
  };

  const handleRoleChange = async (id: string, next: MemberRole) => {
    setError(null);
    try {
      await updateDocumentMemberRole(id, next);
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role: next } : m)));
    } catch (err) {
      message(err, '权限更新失败');
    }
  };

  const handleRemove = async (id: string) => {
    setError(null);
    try {
      await removeDocumentMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      message(err, '移除协作者失败');
    }
  };

  return (
    <section>
      <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
        协作者{members.length > 0 ? ` (${members.length})` : ''}
      </h4>

      <div className="space-y-1">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-2 rounded-md px-2 py-1.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] uppercase text-muted-foreground">
              {(member.name || member.email).slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px]">
              {member.name || member.email}
            </span>
            {canManage ? (
              <>
                <select
                  aria-label={`协作者权限：${member.email}`}
                  value={member.role}
                  onChange={(e) => void handleRoleChange(member.id, e.target.value as MemberRole)}
                  className="h-6 rounded border border-input bg-transparent px-1 text-[11px] outline-none focus:border-ring"
                >
                  {ROLES.map((option) => (
                    <option key={option} value={option}>
                      {ROLE_LABELS[option]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label={`移除协作者 ${member.email}`}
                  onClick={() => void handleRemove(member.id)}
                  className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </>
            ) : (
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {ROLE_LABELS[member.role]}
              </span>
            )}
          </div>
        ))}
      </div>

      {canManage && (
        <div className="mt-2 flex items-center gap-1.5">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleAdd();
            }}
            placeholder="邮箱地址"
            aria-label="协作者邮箱"
            className="h-7 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-[12px] outline-none focus:border-ring"
          />
          <select
            aria-label="新增协作者权限"
            value={role}
            onChange={(e) => setRole(e.target.value as MemberRole)}
            className="h-7 shrink-0 rounded-md border border-input bg-transparent px-1 text-[11px] outline-none focus:border-ring"
          >
            {ROLES.map((option) => (
              <option key={option} value={option}>
                {ROLE_LABELS[option]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={busy || !email.trim()}
            className="h-7 shrink-0 rounded-md border border-input px-2 text-[11px] transition-colors hover:bg-muted disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-3 animate-spin" /> : '添加'}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-1.5 text-[11px] text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
