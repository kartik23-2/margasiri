'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AuthNavLink() {
  const [label, setLabel] = useState('Sign in');
  const [href, setHref] = useState('/signin');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setLabel(data.user.user_metadata?.name ?? data.user.email ?? 'Profile');
        setHref('/profile');
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setLabel(session.user.user_metadata?.name ?? session.user.email ?? 'Profile');
        setHref('/profile');
      } else {
        setLabel('Sign in');
        setHref('/signin');
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <Link href={href} className="hover:opacity-100">
      {label}
    </Link>
  );
}
