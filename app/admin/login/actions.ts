'use server'

import { createServerAnonClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createServerAnonClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/admin/login?error=Credenciales+incorrectas')
  }

  redirect('/admin')
}

export async function logoutAction() {
  const supabase = createServerAnonClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
