import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getOrCreateProfile } from '@/lib/supabase/profile';
import { NextRequest, NextResponse } from 'next/server';

function mapRole(roleName: string): 'admin' | 'member' {
  if (roleName === 'super_admin' || roleName === 'admin') return 'admin';
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

  // Get all clubs with their members
  const { data: allClubs, error } = await supabase.from('clubs').select(
    `
      id,
      name,
      logo_url,
      club_members (
        profiles (id, full_name, avatar_url),
        roles (name)
      )
    `
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const clubs = (allClubs ?? []).map((club: any) => {
    const myMembership = (club.club_members ?? []).find((cm: any) => cm.profiles?.id === profile.id);

    return {
      id: club.id,
      name: club.name,
      logo: club.logo_url,
      role: myMembership ? mapRole(myMembership.roles.name) : null,
      memberCount: club.club_members?.length ?? 0,
      members: (club.club_members ?? [])
        .filter((cm: any) => cm.profiles)
        .map((cm: any) => ({
          id: cm.profiles.id,
          name: cm.profiles.full_name,
          avatar: cm.profiles.avatar_url
        }))
    };
  });

  return NextResponse.json(clubs);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
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

    const formData = await request.formData();
    const name = (formData.get('name') as string)?.trim();
    const description = (formData.get('description') as string)?.trim() || undefined;
    const courtIdsRaw = formData.get('courtIds') as string | null;
    const courtIds: string[] = courtIdsRaw ? JSON.parse(courtIdsRaw) : [];
    const logo = formData.get('logo') as File | null;

    if (!name) {
      return NextResponse.json({ error: 'Club name is required' }, { status: 400 });
    }

    // Upload logo if provided
    let logoUrl: string | undefined;
    if (logo) {
      const ext = logo.name.split('.').pop()?.toLowerCase() ?? 'png';
      const filePath = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await adminClient.storage.from('Club logo').upload(filePath, logo, {
        contentType: logo.type || `image/${ext}`,
        upsert: false
      });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: publicUrlData } = adminClient.storage.from('Club logo').getPublicUrl(filePath);
      logoUrl = publicUrlData.publicUrl;
    }

    // Create the club
    const { data: club, error: clubError } = await adminClient
      .from('clubs')
      .insert({ name, description, logo_url: logoUrl })
      .select()
      .single();

    if (clubError) {
      return NextResponse.json({ error: clubError.message }, { status: 500 });
    }

    // Get the admin role
    const { data: role } = await adminClient.from('roles').select('id').eq('name', 'admin').single();

    if (!role) {
      return NextResponse.json({ error: 'Role configuration error' }, { status: 500 });
    }

    // Add the creator as admin
    const { error: memberError } = await adminClient.from('club_members').insert({
      club_id: club.id,
      profile_id: profile.id,
      role_id: role.id,
      membership_status: 'active'
    });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    // Link courts to the club
    if (courtIds.length > 0) {
      await adminClient.from('club_courts').insert(courtIds.map(courtId => ({ club_id: club.id, court_id: courtId })));
    }

    return NextResponse.json(
      {
        id: club.id,
        name: club.name,
        logo: club.logo_url,
        role: 'admin' as const,
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
  } catch (err) {
    console.error('[POST /api/clubs]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
