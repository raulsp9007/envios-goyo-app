'use server'

import { createServiceClient } from '@/lib/supabase/server'
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
  const parsed = ProductSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/productos/nuevo?error=Datos+invalidos')

  const supabase = createServiceClient()
  await supabase.from('products').insert({ ...parsed.data, active: true })
  revalidatePath('/admin/productos')
  redirect('/admin/productos')
}

export async function updateProductAction(id: string, formData: FormData) {
  const parsed = ProductSchema.partial().safeParse(Object.fromEntries(formData))
  if (!parsed.success) return

  const supabase = createServiceClient()
  await supabase.from('products').update(parsed.data).eq('id', id)
  revalidatePath('/admin/productos')
}

export async function toggleProductAction(id: string, active: boolean) {
  const supabase = createServiceClient()
  await supabase.from('products').update({ active }).eq('id', id)
  revalidatePath('/admin/productos')
}
