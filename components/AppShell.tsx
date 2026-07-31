'use client';

import { usePathname } from 'next/navigation';
import BottomTabBar from '@/components/BottomTabBar';
import { LanguageProvider } from '@/components/LanguageProvider';
import TopAppBar from '@/components/TopAppBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = pathname.startsWith('/directions/');

  if (immersive) {
    return <LanguageProvider>{children}</LanguageProvider>;
  }

  return (
    <LanguageProvider>
      <TopAppBar />
      <div className="pb-24">{children}</div>
      <BottomTabBar />
    </LanguageProvider>
  );
}
