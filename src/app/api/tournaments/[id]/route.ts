import { createClient } from '@/lib/supabase/server';
import { getOrCreateProfile } from '@/lib/supabase/profile';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getOrCreateProfile(supabase, user);
  if (!profile) {
    return NextResponse.json({ error: 'Failed to resolve profile' }, { status: 500 });
  }

  // Fetch the tournament to get its club_id
  const { data: tournament, error: fetchError } = await supabase
    .from('tournaments')
    .select('id, club_id')
    .eq('id', id)
    .single();

  if (fetchError || !tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  // Verify the user is an admin of that club
  const { data: membership } = await supabase
    .from('club_members')
    .select('roles (name)')
    .eq('club_id', tournament.club_id)
    .eq('profile_id', profile.id)
    .single();

  const roleName: string = (membership as any)?.roles?.name ?? '';
  const isAdmin = roleName === 'super_admin' || roleName === 'admin';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error: deleteError } = await supabase.from('tournaments').delete().eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
