'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthNavLink from '@/components/AuthNavLink';

export default function Nav() {
  const pathname = usePathname();

  if (pathname.startsWith('/journey/')) return null;

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-paper/90 backdrop-blur border-b border-black/10">
      <Link href="/" className="flex items-center gap-2 font-display text-xl">
        <span className="w-8 h-8 rounded-full border-2 border-vermillion flex items-center justify-center text-vermillion text-sm -rotate-6">
          म
        </span>
        Margasiri
      </Link>
      <div className="hidden md:flex gap-6 text-sm font-medium opacity-75">
        <Link href="/explore" className="hover:opacity-100">Explore</Link>
        <Link href="/explore" className="hover:opacity-100">India</Link>
        <Link href="/settings" className="hover:opacity-100">Settings</Link>
        <AuthNavLink />
      </div>
      <Link
        href="/explore"
        className="bg-indigo text-paper-light px-4 py-2 rounded-lg text-sm font-semibold"
      >
        Start exploring
      </Link>
    </nav>
  );
}
