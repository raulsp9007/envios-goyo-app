'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { sendNewOrderEmail, sendWhatsAppNotification } from '@/lib/notifications'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const CheckoutSchema = z.object({
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: z.string().min(6),
  customer_note: z.string().optional(),
  shipping_method: z.enum(['pickup', 'delivery']),
  municipality_id: z.coerce.number().optional(),
  customer_address: z.string().optional(),
  cart: z.string(),
})

export async function createOrderAction(formData: FormData) {
  const parsed = CheckoutSchema.safeParse({
    customer_name: formData.get('customer_name'),
    customer_email: formData.get('customer_email'),
    customer_phone: formData.get('customer_phone'),
    customer_note: formData.get('customer_note') ?? '',
    shipping_method: formData.get('shipping_method') ?? 'delivery',
    municipality_id: formData.get('municipality_id') || undefined,
    customer_address: formData.get('customer_address') ?? '',
    cart: formData.get('cart'),
  })

  if (!parsed.success) redirect('/checkout?error=Formulario+invalido')

  const {
    customer_name, customer_email, customer_phone, customer_note, cart,
    shipping_method, municipality_id, customer_address,
  } = parsed.data

  const cartItems: { product_id: string; name: string; price_usd: number; quantity: number }[] = JSON.parse(cart)
  if (cartItems.length === 0) redirect('/carrito')

  const supabase = createServiceClient()

  const productIds = cartItems.map(i => i.product_id)

  // Parallel fetch: all pre-order data at once
  const [
    { data: rateRow },
    { data: products },
    { data: settingRow },
    munResult,
  ] = await Promise.all([
    supabase.from('exchange_rate').select('rate').eq('id', 1).single(),
    supabase.from('products').select('id, price_usd, cost_cup').in('id', productIds),
    supabase.from('settings').select('value').eq('key', 'payment_instructions').single(),
    shipping_method === 'delivery' && municipality_id
      ? supabase
          .from('municipalities')
          .select('name, surcharge_usd, provinces(name, base_price_usd)')
          .eq('id', municipality_id)
          .single()
      : Promise.resolve({ data: null }),
  ])

  const exchange_rate = rateRow?.rate ?? 600
  const productMap = new Map((products ?? []).map(p => [p.id, p]))
  const payment_instructions = settingRow?.value ?? ''
  const products_total = cartItems.reduce((s, i) => s + i.price_usd * i.quantity, 0)

  let shipping_cost_usd = 0
  let customer_municipio = ''
  let customer_provincia = ''

  const mun = munResult.data
  if (mun) {
    const { data: config } = await supabase.from('shipping_config').select('fuel_cost_usd').eq('id', 1).single()
    const fuel = config?.fuel_cost_usd ?? 0
    const prov = mun.provinces as unknown as { name: string; base_price_usd: number }
    shipping_cost_usd = mun.surcharge_usd + prov.base_price_usd + fuel
    customer_municipio = mun.name
    customer_provincia = prov.name
  }

  const total_usd = Math.round((products_total + shipping_cost_usd) * 100) / 100

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_name,
      customer_email,
      customer_phone,
      customer_address: customer_address ?? '',
      customer_municipio,
      customer_provincia,
      customer_note: customer_note ?? '',
      total_usd,
      shipping_method,
      shipping_cost_usd,
      exchange_rate_snapshot: exchange_rate,
      payment_instructions,
    })
    .select()
    .single()

  if (error || !order) {
    console.error('[checkout] Error creando orden:', error)
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

  // Fire-and-forget — don't block redirect on notifications
  Promise.all([
    sendNewOrderEmail(order, orderItems),
    sendWhatsAppNotification(order),
  ]).catch(e => console.error('[checkout] Notification error:', e))

  redirect(`/orden/${order.id}?nueva=1`)
}
