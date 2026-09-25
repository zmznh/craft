'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 8) {
      setError('密码至少需要 8 个字符');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? '注册失败');
        setLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('注册成功，但自动登录失败，请手动登录');
        router.push('/login');
      } else {
        router.push('/documents');
      }
    } catch {
      setError('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm rounded-2xl border border-border bg-card py-6 shadow-lg ring-0">
      <CardHeader className="text-center">
        <CardTitle className="text-title font-semibold">创建账号</CardTitle>
        <CardDescription className="text-ui text-foreground/40">注册以开始使用 Crafty</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-ui text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-ui font-medium">名称</Label>
            <Input
              id="name"
              type="text"
              placeholder="你的名字"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="h-8 rounded-md border-border text-ui focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-ui font-medium">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-8 rounded-md border-border text-ui focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-ui font-medium">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="至少 8 个字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-8 rounded-md border-border text-ui focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-ui font-medium">确认密码</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? '注册中...' : '注册'}
          </Button>
          <p className="text-ui text-foreground/40">
            已有账号？{' '}
            <Link href="/login" className="text-ui text-foreground/40 transition-colors duration-150 hover:text-foreground hover:underline">
              登录
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
