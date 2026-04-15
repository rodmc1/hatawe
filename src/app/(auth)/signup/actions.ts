'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signup(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password.trim()) {
    redirect('/signup?error=Email+and+password+are+required');
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password: password.trim()
  });

  if (error) {
    redirect('/login?error=Signup+failed');
  }

  revalidatePath('/', 'layout');
  redirect('/login?message=Check+your+email+to+confirm');
}
