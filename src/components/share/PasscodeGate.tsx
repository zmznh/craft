'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PasscodeGateProps {
  token: string;
  path: string;
  title: string;
  icon: string | null;
}

export function PasscodeGate({ token, path, title, icon }: PasscodeGateProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim() || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/s/${token}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, path }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      setError(true);
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-foreground/8 bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-foreground/4">
          <Lock className="size-5 text-foreground/40" />
        </div>
        <div className="mb-1 text-2xl">{icon || '📄'}</div>
        <h1 className="mb-1 truncate text-h3 font-semibold text-[#1F2225] dark:text-[#F9F9F9]">{title || '未命名'}</h1>
        <p className="mb-6 text-ui text-foreground/55">此文档受口令保护，请输入口令查看</p>
        <form onSubmit={handleSubmit} className={error ? 'animate-shake' : ''}>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              setError(false);
            }}
            placeholder="输入口令"
            aria-label="访问口令"
            className="h-10 w-full rounded-lg border border-foreground/10 bg-foreground/4 px-3 text-center text-ui outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
          />
          {error && (
            <p className="mt-2 text-meta text-destructive" role="alert">
              口令错误，请重试
            </p>
          )}
          <Button
            type="submit"
            className="mt-4 w-full bg-craft-accent text-white transition-colors duration-150 ease-craft hover:bg-craft-accent-hover"
            disabled={loading || !passcode.trim()}
          >
            {loading ? '验证中…' : '解锁'}
          </Button>
        </form>
      </div>
    </div>
  );
}
