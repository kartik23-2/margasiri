import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv, isSupabaseConfigured } from '@/lib/supabase/config';

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;

  const { url, publishableKey } = getSupabaseEnv();
  return createBrowserClient(url, publishableKey);
}
