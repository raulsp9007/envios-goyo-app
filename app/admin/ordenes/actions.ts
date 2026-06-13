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
