'use client';

import { usePathname } from 'next/navigation';
import BottomTabBar from '@/components/BottomTabBar';
import TopAppBar from '@/components/TopAppBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <TopAppBar />
      <div className="pb-24">{children}</div>
      <BottomTabBar />
    </>
  );
}
