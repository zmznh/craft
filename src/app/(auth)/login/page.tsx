'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/documents';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('邮箱或密码错误');
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm rounded-2xl border border-border bg-card py-6 shadow-lg ring-0">
      <CardHeader className="text-center">
        <CardTitle className="text-title font-semibold">登录 Crafty</CardTitle>
        <CardDescription className="text-ui text-foreground/40">输入你的账号信息以继续</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-ui text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-ui font-medium">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="h-8 rounded-md border-border text-ui focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-ui font-medium">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-8 rounded-md border-border text-ui focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 rounded-b-2xl border-0 bg-transparent pb-2">
          <Button
            type="submit"
            className="h-8 w-full rounded-lg bg-craft-accent text-ui font-medium text-white transition-colors duration-150 hover:bg-craft-accent-hover"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>
          <p className="text-ui text-foreground/40">
            还没有账号？{' '}
            <Link href="/register" className="text-ui text-foreground/40 transition-colors duration-150 hover:text-foreground hover:underline">
              注册
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
