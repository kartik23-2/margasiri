'use client';

import Link from 'next/link';
import { Bookmark, CalendarDays, Compass, Home, Map, UserCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';

const tabs = [
  { href: '/', labelKey: 'home', icon: Home },
  { href: '/explore', labelKey: 'explore', icon: Compass },
  { href: '/map', labelKey: 'map', icon: Map },
  { href: '/trip', labelKey: 'trip', icon: CalendarDays },
  { href: '/saved', labelKey: 'saved', icon: Bookmark },
  { href: '/profile', labelKey: 'profile', icon: UserCircle }
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomTabBar() {
  const pathname = usePathname();
  const { tr } = useLanguage();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-paper/10 bg-indigo px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 text-paper-light shadow-2xl">
      <div className="mx-auto grid max-w-2xl grid-cols-6">
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition ${
                active ? 'text-marigold' : 'text-paper-light/70 hover:text-paper-light'
              }`}
            >
              <Icon size={21} strokeWidth={active ? 2.8 : 2.1} />
              <span>{tr(tab.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
