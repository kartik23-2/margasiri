'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  function getSupabase() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus('Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
      return null;
    }
    return supabase;
  }

  async function continueWithGoogle() {
    const supabase = getSupabase();
    if (!supabase) return;

    setStatus('Opening Google sign-in...');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`
      }
    });

    if (error) setStatus(error.message);
  }

  async function signInWithEmail(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;

    setBusy(true);
    setStatus('Signing in...');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus('Signed in. Opening your profile...');
    router.push('/profile');
    router.refresh();
  }

  async function signUpWithEmail() {
    const supabase = getSupabase();
    if (!supabase) return;

    setBusy(true);
    setStatus('Creating your account...');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`
      }
    });
    setBusy(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus('Account created. Check your email if confirmation is enabled, then sign in.');
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-indigo px-6 py-16 text-paper-light">
      <div className="mx-auto max-w-md rounded-2xl border border-paper/20 bg-paper-light p-6 text-ink shadow-2xl">
        <p className="text-xs uppercase tracking-widest opacity-50">Margasiri account</p>
        <h1 className="mt-2 font-display text-4xl">Sign in</h1>
        <p className="mt-3 text-sm leading-relaxed opacity-75">
          Save places, mark visits, build your map, and manage your Margasiri profile.
        </p>

        <form onSubmit={signInWithEmail} className="mt-6 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide opacity-50">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-indigo"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide opacity-50">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              placeholder="At least 6 characters"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-indigo"
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-indigo px-4 py-3 text-sm font-semibold text-paper-light disabled:opacity-60"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={signUpWithEmail}
              disabled={busy || !email || password.length < 6}
              className="rounded-lg border border-indigo px-4 py-3 text-sm font-semibold text-indigo disabled:opacity-60"
            >
              Sign up
            </button>
          </div>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-black/10" />
          <span className="text-xs uppercase tracking-widest opacity-50">or</span>
          <span className="h-px flex-1 bg-black/10" />
        </div>

        <button
          type="button"
          onClick={continueWithGoogle}
          disabled={busy}
          className="w-full rounded-lg bg-paper border border-black/10 px-4 py-3 text-sm font-semibold text-ink disabled:opacity-60"
        >
          Continue with Google
        </button>
        {status && <p className="mt-4 rounded-lg bg-paper border border-black/10 p-3 text-xs opacity-75">{status}</p>}
      </div>
    </div>
  );
}
