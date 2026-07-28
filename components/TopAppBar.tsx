'use client';

import Link from 'next/link';
import { Bell, UserCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function TopAppBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-paper/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl">
          <span className="flex h-8 w-8 -rotate-6 items-center justify-center rounded-full border-2 border-vermillion text-sm text-vermillion">
            M
          </span>
          Margasiri
        </Link>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-full border border-black/10 bg-paper-light p-2" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <Link href="/profile" className="rounded-full border border-black/10 bg-paper-light p-2" aria-label="Profile">
            <UserCircle size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
