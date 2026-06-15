'use server'

import { createAuthClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateSettingsAction(formData: FormData) {
  const auth = createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/admin/login')

  const supabase = createServiceClient()

  const textKeys = ['payment_instructions', 'business_name', 'business_tagline']
  const boolKeys = ['auto_approve_proof']

  await Promise.all([
    ...textKeys.map(key => {
      const value = formData.get(key) as string
      if (value === null) return Promise.resolve()
      return supabase.from('settings').upsert({ key, value }, { onConflict: 'key' })
    }),
    ...boolKeys.map(key => {
      const value = formData.get(key) === 'on' ? 'true' : 'false'
      return supabase.from('settings').upsert({ key, value }, { onConflict: 'key' })
    }),
  ])

  revalidatePath('/admin/configuracion')
}
