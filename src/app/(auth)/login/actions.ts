'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password.trim()) {
    redirect('/login?error=Email+and+password+are+required');
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim()
  });

  if (error) {
    redirect('/login?error=Invalid+credentials');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function loginWithGoogle() {
  const supabase = await createClient();
  const headersList = await headers();
  const origin =
    headersList.get('origin') ||
    `${headersList.get('x-forwarded-proto') || 'https'}://${headersList.get('host')}`;

  if (!origin || origin === 'https://') {
    redirect('/login?error=Google+login+failed');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/callback`
    }
  });

  if (error) {
    redirect('/login?error=Google+login+failed');
  }

  redirect(data.url);
}
