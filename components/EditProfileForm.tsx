'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { isValidProfilePicture, PROFILE_PICTURES_BUCKET, profilePicturePath } from '@/lib/supabase/profilePictures';

export default function EditProfileForm() {
  const [name, setName] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase?.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from('profiles')
        .select('name, image')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(async ({ data: profile }) => {
          setName(profile?.name ?? data.user?.user_metadata?.name ?? '');
          setImagePath(profile?.image ?? data.user?.user_metadata?.avatar_path ?? null);

          const path = profile?.image ?? data.user?.user_metadata?.avatar_path;
          if (path) {
            const { data: signed } = await supabase.storage.from(PROFILE_PICTURES_BUCKET).createSignedUrl(path, 3600);
            setPreviewUrl(signed?.signedUrl ?? '');
          }
        });
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

    let nextImagePath = imagePath;
    if (file) {
      if (!isValidProfilePicture(file)) {
        setStatus('Choose an image under 5 MB.');
        return;
      }

      setStatus('Uploading profile picture...');
      const path = profilePicturePath(data.user.id, file);
      const { error: uploadError } = await supabase.storage
        .from(PROFILE_PICTURES_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        setStatus(uploadError.message);
        return;
      }

      if (imagePath) await supabase.storage.from(PROFILE_PICTURES_BUCKET).remove([imagePath]);
      nextImagePath = path;
      setImagePath(path);
      const { data: signed } = await supabase.storage.from(PROFILE_PICTURES_BUCKET).createSignedUrl(path, 3600);
      setPreviewUrl(signed?.signedUrl ?? '');
    }

    const { error } = await supabase.auth.updateUser({ data: { name, avatar_path: nextImagePath } });
    if (error) {
      setStatus(error.message);
      return;
    }

    await supabase.from('profiles').upsert({ id: data.user.id, name, image: nextImagePath, email: data.user.email });
    setFile(null);
    setStatus('Profile updated.');
  }

  return (
    <form onSubmit={save} className="mt-8 rounded-2xl border border-black/10 bg-paper-light p-5">
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wide opacity-50">Name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-black/10 bg-white px-3 py-3 text-sm" />
      </label>
      <label className="mt-4 block">
        <span className="mb-1 block text-xs uppercase tracking-wide opacity-50">Profile picture</span>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null;
            setFile(nextFile);
            if (nextFile) setPreviewUrl(URL.createObjectURL(nextFile));
          }}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-3 text-sm"
        />
      </label>
      {previewUrl && (
        <div className="mt-4 flex items-center gap-3">
          <img src={previewUrl} alt="" className="h-16 w-16 rounded-full border border-black/10 object-cover" />
          <p className="text-xs opacity-65">Image files are uploaded to the Supabase `profile_pictures` bucket. The profile row stores the storage path, not an external image URL.</p>
        </div>
      )}
      <button type="submit" className="mt-5 rounded-lg bg-indigo px-5 py-3 text-sm font-semibold text-paper-light">
        Save profile
      </button>
      {status && <p className="mt-3 text-sm opacity-70">{status}</p>}
    </form>
  );
}
