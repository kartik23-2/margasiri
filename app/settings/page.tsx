import Link from 'next/link';
import { DeleteAccountButton, LogoutButton, ShareAppButton } from '@/components/SettingsActions';

export const metadata = {
  title: 'Settings | Margasiri'
};

const rows = [
  { label: 'Edit profile', description: 'Name and profile photo', href: '/settings/edit-profile' },
  // Placeholder until mobile apps are published; replace with real store URLs before launch.
  { label: 'Rate app', description: 'Store listing coming before public launch', href: 'https://example.com/margasiri-store-placeholder' },
  { label: 'Terms of use', description: 'Legal placeholder for review', href: '/legal/terms' },
  { label: 'Privacy notice', description: 'Location and account data policy placeholder', href: '/legal/privacy' }
];

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-4xl">Account settings</h1>
      <div className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-paper-light">
        {rows.map((row) => (
          <Link key={row.label} href={row.href} className="block border-b border-black/10 p-5 hover:bg-paper">
            <span className="font-semibold">{row.label}</span>
            <span className="block text-xs opacity-60">{row.description}</span>
          </Link>
        ))}
        <div className="border-b border-black/10 p-5 hover:bg-paper"><ShareAppButton /></div>
        <a href="mailto:fiveutechnologies@gmail.com" className="block border-b border-black/10 p-5 hover:bg-paper">
          <span className="font-semibold">Contact us</span>
          <span className="block text-xs opacity-60">fiveutechnologies@gmail.com</span>
        </a>
        <div className="border-b border-black/10 p-5 hover:bg-paper"><LogoutButton /></div>
        <div className="p-5 hover:bg-paper"><DeleteAccountButton /></div>
      </div>
    </main>
  );
}
