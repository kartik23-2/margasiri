'use client';

import { usePathname } from 'next/navigation';
import BottomTabBar from '@/components/BottomTabBar';
import TopAppBar from '@/components/TopAppBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isJourney = pathname.startsWith('/journey/');

  return (
    <>
      <TopAppBar />
      <div className={isJourney ? '' : 'pb-24'}>{children}</div>
      <BottomTabBar />
    </>
  );
}
