'use server'

import { createAuthClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getAuthedClient() {
  const auth = createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/admin/login')
  return createServiceClient()
}

export async function saveShippingConfigAction(formData: FormData) {
  const supabase = await getAuthedClient()
  await supabase.from('shipping_config').upsert({
    id: 1,
    fuel_cost_usd: Number(formData.get('fuel_cost_usd')) || 0,
    pickup_enabled: formData.get('pickup_enabled') === 'on',
    delivery_enabled: formData.get('delivery_enabled') === 'on',
    pickup_address: (formData.get('pickup_address') as string) ?? '',
  })
  revalidatePath('/admin/transporte')
}

export async function createProvinceAction(formData: FormData) {
  const supabase = await getAuthedClient()
  const { data: maxRow } = await supabase
    .from('provinces')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .single()
  const position = (maxRow?.position ?? -1) + 1
  await supabase.from('provinces').insert({
    name: (formData.get('name') as string).trim(),
    base_price_usd: Number(formData.get('base_price_usd')) || 0,
    position,
  })
  revalidatePath('/admin/transporte')
}

export async function updateProvinceAction(formData: FormData) {
  const supabase = await getAuthedClient()
  const id = Number(formData.get('id'))
  await supabase.from('provinces').update({
    name: (formData.get('name') as string).trim(),
    base_price_usd: Number(formData.get('base_price_usd')) || 0,
  }).eq('id', id)
  revalidatePath('/admin/transporte')
}

export async function deleteProvinceAction(formData: FormData) {
  const supabase = await getAuthedClient()
  const id = Number(formData.get('id'))
  await supabase.from('provinces').delete().eq('id', id)
  revalidatePath('/admin/transporte')
}

export async function createMunicipalityAction(formData: FormData) {
  const supabase = await getAuthedClient()
  await supabase.from('municipalities').insert({
    province_id: Number(formData.get('province_id')),
    name: (formData.get('name') as string).trim(),
    surcharge_usd: Number(formData.get('surcharge_usd')) || 0,
  })
  revalidatePath('/admin/transporte')
}

export async function updateMunicipalityAction(formData: FormData) {
  const supabase = await getAuthedClient()
  const id = Number(formData.get('id'))
  await supabase.from('municipalities').update({
    name: (formData.get('name') as string).trim(),
    surcharge_usd: Number(formData.get('surcharge_usd')) || 0,
  }).eq('id', id)
  revalidatePath('/admin/transporte')
}

export async function deleteMunicipalityAction(formData: FormData) {
  const supabase = await getAuthedClient()
  const id = Number(formData.get('id'))
  await supabase.from('municipalities').delete().eq('id', id)
  revalidatePath('/admin/transporte')
}
