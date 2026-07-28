import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const user = data.user;

  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    return NextResponse.json({ error: 'Supabase service role key is not configured' }, { status: 500 });
  }

  const admin = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  await Promise.all([
    admin.from('saved_places').delete().eq('user_id', user.id),
    admin.from('visited_places').delete().eq('user_id', user.id),
    admin.from('contributions').delete().eq('user_id', user.id),
    admin.from('places').update({ contributor_id: null }).eq('contributor_id', user.id),
    admin.from('profiles').delete().eq('id', user.id)
  ]);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
