import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // `next` lets the login page specify where to send the user after auth.
  // Defaults to /dashboard.
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    // No auth code — something went wrong with the OAuth flow.
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // ── Ensure a players row exists for this user ────────────────────────────
  // The handle_new_user() trigger on auth.users creates the row automatically
  // on first sign-up. This upsert is a belt-and-suspenders guard: it does
  // nothing when the row already exists (ignoreDuplicates) and creates it when
  // the trigger somehow missed it (e.g. a replayed OAuth login on a fresh DB).
  //
  // getClaims() reads the JWT from the cookie that was just set by
  // exchangeCodeForSession — no extra network round-trip needed.
  const claims = await (async () => {
    const { data, error: claimsError } = await supabase.auth.getClaims()
    if (claimsError || !data?.claims) return null
    return data.claims
  })()

  if (claims) {
    // Pull profile data from the Google identity stored in user_metadata.
    // getUser() is used here (not getClaims()) so we have access to the full
    // user record including raw_user_meta_data from the OAuth provider.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const meta = user.user_metadata ?? {}
      await supabase
        .from('players')
        .upsert(
          {
            id: user.id,
            full_name: (meta.full_name as string | undefined) ?? '',
            email: user.email ?? '',
            avatar_url: (meta.avatar_url as string | undefined) ?? null,
            skill_level: 'Unrated',
          },
          { onConflict: 'id', ignoreDuplicates: true },
        )
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
