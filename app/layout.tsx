import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Geist, Space_Grotesk } from 'next/font/google';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const space = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

const description =
  'A quiet place to study. Set one intention, track your focus, and clear the distractions with zen mode.';

export const metadata: Metadata = {
  applicationName: 'StudyHub',
  title: {
    default: 'StudyHub — a little room for focus',
    template: '%s · StudyHub',
  },
  description,
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: 'StudyHub',
    title: 'StudyHub — a little room for focus',
    description,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'StudyHub — a little room for focus',
    description,
  },
};

export const viewport: Viewport = {
  themeColor: '#17191e',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${space.variable}`}>
      <body>{children}</body>
    </html>
  );
}
