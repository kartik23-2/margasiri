'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function EditProfileForm() {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase?.auth.getUser().then(({ data }) => {
      setName(data.user?.user_metadata?.name ?? '');
      setImage(data.user?.user_metadata?.avatar_url ?? '');
    });
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus('Supabase is not configured yet.');
      return;
    }

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setStatus('Sign in first.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ data: { name, avatar_url: image } });
    if (error) {
      setStatus(error.message);
      return;
    }

    await supabase.from('profiles').upsert({ id: data.user.id, name, image, email: data.user.email });
    setStatus('Profile updated.');
  }

  return (
    <form onSubmit={save} className="mt-8 rounded-2xl border border-black/10 bg-paper-light p-5">
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wide opacity-50">Name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-black/10 bg-white px-3 py-3 text-sm" />
      </label>
      <label className="mt-4 block">
        <span className="mb-1 block text-xs uppercase tracking-wide opacity-50">Profile photo URL</span>
        <input value={image} onChange={(event) => setImage(event.target.value)} className="w-full rounded-lg border border-black/10 bg-white px-3 py-3 text-sm" />
      </label>
      <button type="submit" className="mt-5 rounded-lg bg-indigo px-5 py-3 text-sm font-semibold text-paper-light">
        Save profile
      </button>
      {status && <p className="mt-3 text-sm opacity-70">{status}</p>}
    </form>
  );
}
