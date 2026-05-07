import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { clubId, name, email, level, membershipDate } = body;

  if (!clubId || !name || !email) {
    return NextResponse.json({ error: 'clubId, name and email are required' }, { status: 400 });
  }

  const requesterProfile = await getOrCreateProfile(supabase, user);
  if (!requesterProfile) {
    return NextResponse.json({ error: 'Failed to resolve profile' }, { status: 500 });
  }

  // Only admins/super_admins can add players
  const { data: requesterMembership } = await supabase
    .from('club_members')
    .select('roles (name)')
    .eq('club_id', clubId)
    .eq('profile_id', requesterProfile.id)
    .single();

  const requesterRole = (requesterMembership as any)?.roles?.name;
  if (!requesterRole || !['admin', 'super_admin'].includes(requesterRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Find or create profile for the invitee
  const adminClient = createAdminClient();
  let { data: targetProfile } = await adminClient.from('profiles').select('id').eq('email', email).maybeSingle();

  if (!targetProfile) {
    const { data: newProfile, error: profileError } = await adminClient
      .from('profiles')
      .insert({ full_name: name, email })
      .select('id')
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
    targetProfile = newProfile;
  }

  // Get player role id
  const { data: playerRole } = await supabase.from('roles').select('id').eq('name', 'player').single();

  if (!playerRole) {
    return NextResponse.json({ error: 'Player role not found' }, { status: 500 });
  }

  // Insert into club_members (upsert to avoid duplicates)
  const { error: memberError } = await supabase.from('club_members').upsert(
    {
      club_id: clubId,
      profile_id: targetProfile.id,
      role_id: playerRole.id,
      membership_status: 'active',
      joined_at: membershipDate ?? new Date().toISOString()
    },
    { onConflict: 'club_id,profile_id' }
  );

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
