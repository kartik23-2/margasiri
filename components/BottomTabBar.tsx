'use client';

import Link from 'next/link';
import { Bookmark, CalendarDays, Compass, Home, Map, UserCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/trip', label: 'Trip', icon: CalendarDays },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/profile', label: 'Profile', icon: UserCircle }
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomTabBar() {
  const pathname = usePathname();

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
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
