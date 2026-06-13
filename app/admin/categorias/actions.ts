'use server'

import { createAuthClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const CategorySchema = z.object({
  name: z.string().min(1).max(50).trim(),
  emoji: z.string().min(1).max(8).trim(),
})

async function requireAdmin() {
  const auth = createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/admin/login')
}

function revalidate() {
  revalidatePath('/admin/categorias')
  revalidatePath('/admin/productos/nuevo')
  revalidatePath('/')
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin()
  const parsed = CategorySchema.safeParse({
    name: formData.get('name'),
    emoji: formData.get('emoji'),
  })
  if (!parsed.success) return

  const supabase = createServiceClient()
  const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true })
  await supabase.from('categories').insert({ ...parsed.data, position: (count ?? 0) + 1 })
  revalidate()
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  if (!id) return

  const parsed = CategorySchema.safeParse({
    name: formData.get('name'),
    emoji: formData.get('emoji'),
  })
  if (!parsed.success) return

  const supabase = createServiceClient()
  await supabase.from('categories').update(parsed.data).eq('id', id)
  revalidate()
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  if (!id) return

  const supabase = createServiceClient()
  await supabase.from('categories').delete().eq('id', id)
  revalidate()
}
