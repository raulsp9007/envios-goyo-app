'use server'

import { createAuthClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export async function updateRateAction(formData: FormData) {
  const auth = createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/admin/login')

  const rate = z.coerce.number().positive().safeParse(formData.get('rate'))
  if (!rate.success) return

  const supabase = createServiceClient()
  await supabase
    .from('exchange_rate')
    .update({ rate: rate.data, updated_at: new Date().toISOString() })
    .eq('id', 1)

  revalidatePath('/admin/tasa')
  revalidatePath('/admin/productos')
}
