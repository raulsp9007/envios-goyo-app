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

async function uploadImageFile(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null
  try {
    const supabase = createServiceClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const { error } = await supabase.storage
      .from('product-images')
      .upload(filename, buffer, { contentType: file.type, upsert: false })
    if (error) return null
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filename)
    return urlData.publicUrl
  } catch {
    return null
  }
}

export async function createProductAction(formData: FormData) {
  const auth = createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/admin/login')

  // Image: prefer file upload over URL
  const file = formData.get('image_file') as File
  const uploadedUrl = await uploadImageFile(file)
  const image_url = uploadedUrl ?? (formData.get('image_url') as string ?? '')

  const parsed = ProductSchema.safeParse({
    ...Object.fromEntries(formData),
    image_url,
  })
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

  const file = formData.get('image_file') as File
  const uploadedUrl = await uploadImageFile(file)
  if (uploadedUrl) formData.set('image_url', uploadedUrl)

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
