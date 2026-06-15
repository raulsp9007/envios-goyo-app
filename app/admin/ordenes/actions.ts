'use server'

import { createAuthClient, createServiceClient } from '@/lib/supabase/server'
import { sendStatusChangeEmail } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { OrderStatus } from '@/types'
import { ORDER_STATUS_FLOW } from '@/types'

export async function advanceOrderStatusAction(orderId: string, currentStatus: OrderStatus) {
  const auth = createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/admin/login')

  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus)
  if (currentIndex === ORDER_STATUS_FLOW.length - 1) return

  const nextStatus = ORDER_STATUS_FLOW[currentIndex + 1]
  const supabase = createServiceClient()

  const { data: order } = await supabase
    .from('orders')
    .update({ status: nextStatus })
    .eq('id', orderId)
    .select('order_number, customer_email, customer_name')
    .single()

  if (order) {
    try {
      await sendStatusChangeEmail(order.customer_email, order.customer_name, order.order_number, nextStatus)
    } catch (e) {
      console.error('Status email error:', e)
    }
  }

  revalidatePath(`/admin/ordenes/${orderId}`)
  revalidatePath('/admin/ordenes')
}

export async function recalculateOrderAction(orderId: string, formData: FormData) {
  const auth = createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/admin/login')

  const supabase = createServiceClient()
  const exchange_rate = Number(formData.get('exchange_rate'))

  await supabase.from('orders')
    .update({ exchange_rate_snapshot: exchange_rate })
    .eq('id', orderId)

  const entries = Array.from(formData.entries())
  const itemEntries = entries.filter(([key]) => key.startsWith('cost_cup_'))

  for (const [key, val] of itemEntries) {
    const itemId = key.replace('cost_cup_', '')
    const cost_cup = Number(val)
    const productIdRaw = formData.get(`product_id_${itemId}`)
    const product_id = productIdRaw && productIdRaw !== '' ? String(productIdRaw) : null

    await supabase.from('order_items').update({ cost_cup }).eq('id', itemId)

    if (product_id) {
      await supabase.from('products').update({ cost_cup }).eq('id', product_id)
    }
  }

  revalidatePath(`/admin/ordenes/${orderId}`)
}

export async function approveProofAction(orderId: string) {
  const auth = createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/admin/login')

  const supabase = createServiceClient()

  const { data: order } = await supabase
    .from('orders')
    .update({ status: 'waiting' })
    .eq('id', orderId)
    .select('order_number, customer_email, customer_name')
    .single()

  if (order) {
    try {
      await sendStatusChangeEmail(order.customer_email, order.customer_name, order.order_number, 'waiting')
    } catch (e) {
      console.error('[proof approve] Email error:', e)
    }
  }

  revalidatePath(`/admin/ordenes/${orderId}`)
}
