import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Shell } from '@/components/shared/shell';
import { ensureSeedData } from '@/lib/db';

export const metadata: Metadata = {
  title: 'AssetFlow AI',
  description: 'AI-powered autonomous revenue distribution for tokenized real-world assets.'
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  await ensureSeedData();
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
