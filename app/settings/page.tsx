import Link from 'next/link';
import { T } from '@/components/LanguageProvider';
import { DeleteAccountButton, LogoutButton, ShareAppButton } from '@/components/SettingsActions';

export const metadata = {
  title: 'Settings | Margasiri'
};

const rows = [
  { labelKey: 'editProfile', descriptionKey: 'nameAndPhoto', href: '/settings/edit-profile' },
  // Placeholder until mobile apps are published; replace with real store URLs before launch.
  { labelKey: 'rateApp', descriptionKey: 'rateAppCopy', href: 'https://example.com/margasiri-store-placeholder' },
  { labelKey: 'termsUse', descriptionKey: 'termsCopy', href: '/legal/terms' },
  { labelKey: 'privacyNotice', descriptionKey: 'privacyCopy', href: '/legal/privacy' }
];

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-4xl"><T k="accountSettings" /></h1>
      <div className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-paper-light">
        {rows.map((row) => (
          <Link key={row.labelKey} href={row.href} className="block border-b border-black/10 p-5 hover:bg-paper">
            <span className="font-semibold"><T k={row.labelKey} /></span>
            <span className="block text-xs opacity-60"><T k={row.descriptionKey} /></span>
          </Link>
        ))}
        <div className="border-b border-black/10 p-5 hover:bg-paper"><ShareAppButton /></div>
        <a href="mailto:fiveutechnologies@gmail.com" className="block border-b border-black/10 p-5 hover:bg-paper">
          <span className="font-semibold"><T k="contactUs" /></span>
          <span className="block text-xs opacity-60">fiveutechnologies@gmail.com</span>
        </a>
        <div className="border-b border-black/10 p-5 hover:bg-paper"><LogoutButton /></div>
        <div className="p-5 hover:bg-paper"><DeleteAccountButton /></div>
      </div>
    </main>
  );
}
