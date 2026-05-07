import { createClient } from '@/lib/supabase/server';
import { getOrCreateProfile } from '@/lib/supabase/profile';
import { NextRequest, NextResponse } from 'next/server';

function mapRole(roleName: string): 'admin' | 'member' {
  if (roleName === 'super_admin' || roleName === 'admin') return 'admin';
  return 'member';
}

async function getProfileAndMembership(supabase: any, user: any, clubId: string) {
  const profile = await getOrCreateProfile(supabase, user);

  if (!profile) return { profile: null, membership: null };

  const { data: membership } = await supabase
    .from('club_members')
    .select('id, roles (name)')
    .eq('club_id', clubId)
    .eq('profile_id', profile.id)
    .single();

  return { profile, membership };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { membership } = await getProfileAndMembership(supabase, user, id);

  const { data: club, error } = await supabase
    .from('clubs')
    .select(
      `
      id,
      name,
      logo_url,
      club_members (
        profiles (id, full_name, avatar_url)
      )
    `
    )
    .eq('id', id)
    .single();

  if (error || !club) {
    return NextResponse.json({ error: 'Club not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: club.id,
    name: club.name,
    logo: club.logo_url,
    role: mapRole(membership.roles.name),
    memberCount: club.club_members?.length ?? 0,
    members: (club.club_members ?? []).map((cm: any) => ({
      id: cm.profiles.id,
      name: cm.profiles.full_name,
      avatar: cm.profiles.avatar_url
    }))
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { membership } = await getProfileAndMembership(supabase, user, id);

  if (!membership) {
    return NextResponse.json({ error: 'Club not found or access denied' }, { status: 404 });
  }

  const role = mapRole(membership.roles.name);
  if (role === 'member') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const body = await request.json();
  const update: Record<string, any> = {};
  if (body.name !== undefined) update.name = body.name.trim();

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data: club, error } = await supabase
    .from('clubs')
    .update(update)
    .eq('id', id)
    .select(
      `
      id,
      name,
      logo_url,
      club_members (
        profiles (id, full_name, avatar_url)
      )
    `
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: club.id,
    name: club.name,
    logo: club.logo_url,
    role,
    memberCount: club.club_members?.length ?? 0,
    members: (club.club_members ?? []).map((cm: any) => ({
      id: cm.profiles.id,
      name: cm.profiles.full_name,
      avatar: cm.profiles.avatar_url
    }))
  });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { membership } = await getProfileAndMembership(supabase, user, id);

  if (!membership) {
    return NextResponse.json({ error: 'Club not found or access denied' }, { status: 404 });
  }

  if (mapRole(membership.roles.name) !== 'admin') {
    return NextResponse.json({ error: 'Only admins can delete clubs' }, { status: 403 });
  }

  const { error } = await supabase.from('clubs').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
