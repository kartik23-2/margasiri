'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function SignInForm() {
  const [status, setStatus] = useState('');

  async function continueWithGoogle() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus('Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
      return;
    }

    setStatus('Opening Google sign-in...');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`
      }
    });

    if (error) setStatus(error.message);
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-indigo px-6 py-16 text-paper-light">
      <div className="mx-auto max-w-md rounded-2xl border border-paper/20 bg-paper-light p-6 text-ink shadow-2xl">
        <p className="text-xs uppercase tracking-widest opacity-50">Margasiri account</p>
        <h1 className="mt-2 font-display text-4xl">Sign in</h1>
        <p className="mt-3 text-sm leading-relaxed opacity-75">
          Save places, mark visits, build your map, and manage your Margasiri profile.
        </p>
        <button
          type="button"
          onClick={continueWithGoogle}
          className="mt-6 w-full rounded-lg bg-indigo px-4 py-3 text-sm font-semibold text-paper-light"
        >
          Continue with Google
        </button>
        {status && <p className="mt-4 rounded-lg bg-paper border border-black/10 p-3 text-xs opacity-75">{status}</p>}
      </div>
    </div>
  );
}
