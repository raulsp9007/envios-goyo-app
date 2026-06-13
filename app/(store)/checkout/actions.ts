'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { sendNewOrderEmail, sendWhatsAppNotification } from '@/lib/notifications'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const CheckoutSchema = z.object({
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: z.string().min(6),
  customer_address: z.string().min(5),
  customer_note: z.string().optional(),
  cart: z.string(),
})

export async function createOrderAction(formData: FormData) {
  const parsed = CheckoutSchema.safeParse({
    customer_name: formData.get('customer_name'),
    customer_email: formData.get('customer_email'),
    customer_phone: formData.get('customer_phone'),
    customer_address: formData.get('customer_address'),
    customer_note: formData.get('customer_note') ?? '',
    cart: formData.get('cart'),
  })

  if (!parsed.success) {
    redirect('/checkout?error=Formulario+invalido')
  }

  const { customer_name, customer_email, customer_phone, customer_address, customer_note, cart } = parsed.data
  const cartItems: { product_id: string; name: string; price_usd: number; quantity: number }[] = JSON.parse(cart)

  if (cartItems.length === 0) {
    redirect('/carrito')
  }

  const supabase = createServiceClient()

  const { data: rateRow } = await supabase
    .from('exchange_rate')
    .select('rate')
    .eq('id', 1)
    .single()

  const exchange_rate = rateRow?.rate ?? 600

  const productIds = cartItems.map(i => i.product_id)
  const { data: products } = await supabase
    .from('products')
    .select('id, price_usd, cost_cup')
    .in('id', productIds)

  const productMap = new Map((products ?? []).map(p => [p.id, p]))

  const total_usd = cartItems.reduce((s, i) => s + i.price_usd * i.quantity, 0)

  const { data: settingRow } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'payment_instructions')
    .single()

  const payment_instructions = settingRow?.value ?? ''

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_note: customer_note ?? '',
      total_usd: Math.round(total_usd * 100) / 100,
      exchange_rate_snapshot: exchange_rate,
      payment_instructions,
    })
    .select()
    .single()

  if (error || !order) {
    redirect('/checkout?error=Error+creando+la+orden')
  }

  const orderItems = cartItems.map(item => {
    const product = productMap.get(item.product_id)
    return {
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      quantity: item.quantity,
      price_usd: item.price_usd,
      cost_cup: product?.cost_cup ?? 0,
    }
  })

  await supabase.from('order_items').insert(orderItems)

  try {
    await Promise.all([
      sendNewOrderEmail(order, orderItems),
      sendWhatsAppNotification(order),
    ])
  } catch (e) {
    console.error('Notification error:', e)
  }

  redirect(`/orden/${order.id}?nueva=1`)
}
