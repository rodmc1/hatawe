import { createClient } from '@/lib/supabase/server';
import { getOrCreateProfile } from '@/lib/supabase/profile';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clubId = request.nextUrl.searchParams.get('clubId');

  if (!clubId) {
    return NextResponse.json({ error: 'clubId query parameter is required' }, { status: 400 });
  }

  // Verify the user is a member of this club
  const profile = await getOrCreateProfile(supabase, user);

  if (!profile) {
    return NextResponse.json({ error: 'Failed to resolve profile' }, { status: 500 });
  }

  const { data: userMembership } = await supabase
    .from('club_members')
    .select('id')
    .eq('club_id', clubId)
    .eq('profile_id', profile.id)
    .single();

  if (!userMembership) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Get all members of the club with their profiles and roles
  const { data: members, error } = await supabase
    .from('club_members')
    .select(
      `
      id,
      membership_status,
      joined_at,
      profiles (id, full_name, avatar_url, phone),
      roles (name)
    `
    )
    .eq('club_id', clubId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const players = (members ?? []).map((m: any) => ({
    id: m.profiles.id,
    name: m.profiles.full_name,
    avatar: m.profiles.avatar_url,
    phone: m.profiles.phone,
    role: m.roles.name,
    membershipStatus: m.membership_status,
    joinedAt: m.joined_at
  }));

  return NextResponse.json(players);
}
