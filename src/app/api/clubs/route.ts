import { createClient } from '@/lib/supabase/server';
import { getOrCreateProfile } from '@/lib/supabase/profile';
import { NextRequest, NextResponse } from 'next/server';

function mapRole(roleName: string): 'owner' | 'admin' | 'member' {
  if (roleName === 'super_admin') return 'owner';
  if (roleName === 'club_admin') return 'admin';
  return 'member';
}

export async function GET() {
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

  // Get clubs the user belongs to, with role and all club members
  const { data: memberships, error } = await supabase
    .from('club_members')
    .select(
      `
      roles (name),
      clubs (
        id,
        name,
        logo_url,
        club_members (
          profiles (id, full_name, avatar_url)
        )
      )
    `
    )
    .eq('profile_id', profile.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const clubs = (memberships ?? []).map((m: any) => ({
    id: m.clubs.id,
    name: m.clubs.name,
    logo: m.clubs.logo_url,
    role: mapRole(m.roles.name),
    memberCount: m.clubs.club_members?.length ?? 0,
    members: (m.clubs.club_members ?? []).map((cm: any) => ({
      id: cm.profiles.id,
      name: cm.profiles.full_name,
      avatar: cm.profiles.avatar_url
    }))
  }));

  return NextResponse.json(clubs);
}

export async function POST(request: NextRequest) {
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

  const body = await request.json();
  const name = body?.name?.trim();

  if (!name) {
    return NextResponse.json({ error: 'Club name is required' }, { status: 400 });
  }

  // Create the club
  const { data: club, error: clubError } = await supabase.from('clubs').insert({ name }).select().single();

  if (clubError) {
    return NextResponse.json({ error: clubError.message }, { status: 500 });
  }

  // Get the super_admin role
  const { data: role } = await supabase.from('roles').select('id').eq('name', 'super_admin').single();

  if (!role) {
    return NextResponse.json({ error: 'Role configuration error' }, { status: 500 });
  }

  // Add the creator as super_admin
  await supabase.from('club_members').insert({
    club_id: club.id,
    profile_id: profile.id,
    role_id: role.id,
    membership_status: 'active'
  });

  return NextResponse.json(
    {
      id: club.id,
      name: club.name,
      logo: club.logo_url,
      role: 'owner' as const,
      memberCount: 1,
      members: [
        {
          id: profile.id,
          name: user.user_metadata?.full_name ?? user.email,
          avatar: user.user_metadata?.avatar_url
        }
      ]
    },
    { status: 201 }
  );
}
