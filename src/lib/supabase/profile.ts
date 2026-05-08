import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Finds or creates a profile row for the given auth user.
 * Returns the profile `{ id }` or `null` if creation fails.
 */
export async function getOrCreateProfile(
  supabase: SupabaseClient,
  user: { id: string; email?: string; user_metadata?: Record<string, any> }
) {
  // Try to find existing profile
  const { data: existing, error: selectError } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (selectError) {
    console.error('Failed to select profile:', selectError.message, selectError.details, selectError.hint);
  }

  if (existing) return existing;

  // Auto-create profile from auth user metadata
  const { data: created, error } = await supabase
    .from('profiles')
    .insert({
      auth_user_id: user.id,
      full_name: user.user_metadata?.full_name ?? user.email ?? '',
      email: user.email ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create profile:', error.message, error.details, error.hint);
    return null;
  }
  return created;
}
