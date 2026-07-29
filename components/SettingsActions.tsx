'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function ShareAppButton() {
  const { tr } = useLanguage();
  const [status, setStatus] = useState('');

  async function share() {
    const shareData = {
      title: 'Margasiri',
      text: 'Find overlooked places across India with live distance and Google Maps directions.',
      url: 'https://margasiri.vercel.app'
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(shareData.url);
    setStatus('Link copied.');
  }

  return (
    <button type="button" onClick={share} className="w-full text-left">
      <span className="font-semibold">{tr('shareApp')}</span>
      <span className="block text-xs opacity-60">{status || 'Send Margasiri to a friend'}</span>
    </button>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const { tr } = useLanguage();

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase?.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button type="button" onClick={logout} className="w-full text-left">
      <span className="font-semibold">{tr('logout')}</span>
      <span className="block text-xs opacity-60">Sign out of this device</span>
    </button>
  );
}

export function DeleteAccountButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState('');

  async function deleteAccount() {
    setStatus('Deleting account...');
    const res = await fetch('/api/account/delete', { method: 'POST' });
    if (!res.ok) {
      setStatus('Account deletion could not be completed. Check Supabase service role configuration.');
      return;
    }

    const supabase = createSupabaseBrowserClient();
    await supabase?.auth.signOut();
    router.push('/?accountDeleted=1');
    router.refresh();
  }

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="w-full text-left text-vermillion">
        <span className="font-semibold">Delete account</span>
        <span className="block text-xs opacity-70">Requires confirmation</span>
      </button>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-vermillion">This permanently deletes your account and all saved/visited data. This cannot be undone.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={deleteAccount} className="rounded-lg bg-vermillion px-4 py-2 text-sm font-semibold text-white">
          Confirm delete
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold">
          Cancel
        </button>
      </div>
      {status && <p className="mt-2 text-xs opacity-70">{status}</p>}
    </div>
  );
}
