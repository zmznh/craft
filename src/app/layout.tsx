import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Crafty',
  description: '你的智能笔记空间',
  manifest: '/manifest.webmanifest',
};

const swRegister = typeof window !== 'undefined'
  ? `if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});`
  : '';

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex h-full flex-col">
        <Providers>{children}</Providers>
        <script dangerouslySetInnerHTML={{ __html: swRegister }} />
      </body>
    </html>
  );
}
