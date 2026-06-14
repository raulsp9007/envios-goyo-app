import { Resend } from 'resend'
import type { OrderStatus } from '@/types'
import { ORDER_STATUS_LABELS } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''
const BUSINESS_NAME = 'Envios Goyo'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const FROM_EMAIL = `${BUSINESS_NAME} <onboarding@resend.dev>`

interface OrderRow {
  id: string
  order_number: number
  customer_name: string
  customer_email: string
  total_usd: number
}

interface ItemRow {
  product_name: string
  quantity: number
  price_usd: number
}

function itemsHtml(items: ItemRow[]) {
  return items
    .map(i => `<tr>
      <td style="padding:4px 8px">${i.product_name}</td>
      <td style="padding:4px 8px;text-align:center">${i.quantity}</td>
      <td style="padding:4px 8px;text-align:right">$${(i.price_usd * i.quantity).toFixed(2)}</td>
    </tr>`)
    .join('')
}

export async function sendNewOrderEmail(order: OrderRow, items: ItemRow[]) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY no configurado — emails desactivados')
    return
  }

  const trackingUrl = `${SITE_URL}/orden/${order.id}`

  const results = await Promise.allSettled([
    resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🛒 Nueva orden #${order.order_number} — $${order.total_usd.toFixed(2)} USD`,
      html: `
        <h2>Nueva orden de ${order.customer_name}</h2>
        <p>Orden #${order.order_number} — Total: <strong>$${order.total_usd.toFixed(2)} USD</strong></p>
        <table border="1" cellpadding="4" style="border-collapse:collapse">
          <thead><tr><th>Producto</th><th>Cant</th><th>Subtotal</th></tr></thead>
          <tbody>${itemsHtml(items)}</tbody>
        </table>
        <p><a href="${SITE_URL}/admin/ordenes/${order.id}">Ver en admin →</a></p>
      `,
    }),
    resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Tu orden #${order.order_number} fue recibida — ${BUSINESS_NAME}`,
      html: `
        <h2>¡Hola ${order.customer_name}!</h2>
        <p>Recibimos tu orden #${order.order_number}.</p>
        <table border="1" cellpadding="4" style="border-collapse:collapse">
          <thead><tr><th>Producto</th><th>Cant</th><th>Subtotal</th></tr></thead>
          <tbody>${itemsHtml(items)}</tbody>
        </table>
        <p><strong>Total: $${order.total_usd.toFixed(2)} USD</strong></p>
        <p><a href="${trackingUrl}">Ver estado de tu orden →</a></p>
      `,
    }),
  ])

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[email] Error enviando email ${i === 0 ? 'admin' : 'cliente'}:`, r.reason)
    } else if (r.value.error) {
      console.error(`[email] Resend rechazó email ${i === 0 ? 'admin' : 'cliente'}:`, r.value.error)
    } else {
      console.log(`[email] Email ${i === 0 ? 'admin' : 'cliente'} enviado OK — id:`, r.value.data?.id)
    }
  })
}

export async function sendStatusChangeEmail(
  email: string,
  name: string,
  orderNumber: number,
  status: OrderStatus
) {
  if (!process.env.RESEND_API_KEY) return

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Tu orden #${orderNumber} — ${ORDER_STATUS_LABELS[status]}`,
    html: `
      <h2>¡Hola ${name}!</h2>
      <p>Tu orden #${orderNumber} ahora está: <strong>${ORDER_STATUS_LABELS[status]}</strong></p>
    `,
  })
}

export async function sendWhatsAppNotification(order: OrderRow) {
  const phone = process.env.CALLMEBOT_PHONE
  const apiKey = process.env.CALLMEBOT_APIKEY
  if (!phone || !apiKey) return

  const message = encodeURIComponent(
    `Nueva orden #${order.order_number} de ${order.customer_name} — $${order.total_usd.toFixed(2)} USD`
  )

  await fetch(
    `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${message}&apikey=${apiKey}`
  )
}
