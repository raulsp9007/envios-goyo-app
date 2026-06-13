'use server'

import { createAuthClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateSettingsAction(formData: FormData) {
  const auth = createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/admin/login')

  const supabase = createServiceClient()
  const keys = ['payment_instructions', 'business_name', 'business_tagline']

  await Promise.all(
    keys.map(key => {
      const value = formData.get(key) as string
      if (!value) return Promise.resolve()
      return supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' })
    })
  )

  revalidatePath('/admin/configuracion')
}
