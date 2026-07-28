import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseEnv, isSupabaseConfigured } from '@/lib/supabase/config';

export function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;

  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot always write cookies; middleware refreshes sessions for requests.
        }
      }
    }
  });
}
