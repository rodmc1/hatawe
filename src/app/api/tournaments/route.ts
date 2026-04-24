import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getOrCreateProfile } from '@/lib/supabase/profile';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: tournaments, error } = await supabase
    .from('tournaments')
    .select(
      `
      id,
      name,
      poster_url,
      club_id,
      tournament_date,
      status,
      max_participants,
      clubs ( name )
    `
    )
    .order('tournament_date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mapped = (tournaments ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    poster_url: t.poster_url ?? null,
    club_id: t.club_id,
    club_name: t.clubs?.name ?? '',
    tournament_date: t.tournament_date,
    status: t.status,
    max_participants: t.max_participants,
    registered_count: 0
  }));

  return NextResponse.json(mapped);
}

export async function POST(request: NextRequest) {
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
  const name = formData.get('name') as string | null;
  const club_id = formData.get('club_id') as string | null;
  const tournament_date = formData.get('tournament_date') as string | null;
  const max_participants_raw = formData.get('max_participants') as string | null;
  const poster = formData.get('poster') as File | null;

  if (!name || !club_id || !tournament_date || !max_participants_raw) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const max_participants = parseInt(max_participants_raw, 10);
  if (isNaN(max_participants) || max_participants < 1) {
    return NextResponse.json({ error: 'Invalid max_participants' }, { status: 400 });
  }

  // Verify the authenticated user is an admin of the submitted club
  const { data: membership } = await supabase
    .from('club_members')
    .select('roles (name)')
    .eq('club_id', club_id)
    .eq('profile_id', profile.id)
    .single();

  const roleName: string = (membership as any)?.roles?.name ?? '';
  const isAdmin = roleName === 'super_admin' || roleName === 'admin';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let poster_url: string | null = null;

  if (poster) {
    const ALLOWED_MIME_TYPES: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif'
    };

    const ext = ALLOWED_MIME_TYPES[poster.type];
    if (!ext) {
      return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
    }

    const path = `tournaments/${club_id}/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await poster.arrayBuffer());

    const { error: uploadError } = await adminClient.storage
      .from('Club posters')
      .upload(path, buffer, { contentType: poster.type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = adminClient.storage.from('Club posters').getPublicUrl(path);
    poster_url = publicUrlData.publicUrl;
  }

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .insert({ name, club_id, tournament_date, max_participants, poster_url, status: 'open' })
    .select('id, name, poster_url, club_id, tournament_date, status, max_participants')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ...tournament, club_name: '', registered_count: 0 }, { status: 201 });
}
