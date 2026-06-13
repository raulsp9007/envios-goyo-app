'use server'

import { createAuthClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const ProductSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price_usd: z.coerce.number().min(0),
  cost_cup: z.coerce.number().min(0),
  description: z.string().optional(),
  image_url: z.string().optional(),
})

export async function createProductAction(formData: FormData) {
  const auth = createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/admin/login')

  const parsed = ProductSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/productos/nuevo?error=Datos+invalidos')

  const supabase = createServiceClient()
  const { error } = await supabase.from('products').insert({ ...parsed.data, active: true })
  if (error) redirect('/admin/productos/nuevo?error=Error+al+guardar')

  revalidatePath('/admin/productos')
  redirect('/admin/productos')
}

export async function updateProductAction(id: string, formData: FormData) {
  const auth = createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/admin/login')

  const parsed = ProductSchema.partial().safeParse(Object.fromEntries(formData))
  if (!parsed.success) return

  const supabase = createServiceClient()
  const { error } = await supabase.from('products').update(parsed.data).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/productos')
}

export async function toggleProductAction(id: string, active: boolean) {
  const auth = createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/admin/login')

  const supabase = createServiceClient()
  await supabase.from('products').update({ active }).eq('id', id)
  revalidatePath('/admin/productos')
}
