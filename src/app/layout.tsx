import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import { ToastProvider } from '@/components/Toast';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LyricVision',
  description: 'Automated TikTok lyric video generator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/5 py-4 text-center text-xs text-zinc-600">
            Videos powered by{' '}
            <a
              href="https://www.pexels.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-400 underline"
            >
              Pexels
            </a>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
