'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string
  });

  if (error) {
    redirect('/auth/login?error=Signup+failed');
  }

  revalidatePath('/', 'layout');
  redirect('/auth/login?message=Check+your+email+to+confirm');
}
