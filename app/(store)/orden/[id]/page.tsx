import { createServiceClient } from '@/lib/supabase/server'
import StatusProgress from '@/components/store/StatusProgress'
import { notFound } from 'next/navigation'
import type { OrderWithItems } from '@/types'

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { nueva?: string }
}) {
  const supabase = createServiceClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, order_number, customer_name, customer_email, status,
      total_usd, exchange_rate_snapshot, payment_instructions, created_at,
      order_items (
        id, product_name, quantity, price_usd
      )
    `)
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  const typedOrder = order as unknown as OrderWithItems

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {searchParams.nueva && (
        <div className="bg-green-900 border border-green-700 text-green-300 rounded-xl p-4 mb-6">
          ✅ ¡Pedido realizado! Revisa tu email para las instrucciones de pago.
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Orden #{typedOrder.order_number}
        </h1>
        <span className="text-slate-400 text-sm">
          {new Date(typedOrder.created_at).toLocaleDateString('es-ES')}
        </span>
      </div>

      <div className="mb-6">
        <StatusProgress status={typedOrder.status} />
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4">
        <h2 className="font-bold text-white mb-3">Productos</h2>
        <div className="space-y-2">
          {typedOrder.order_items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-slate-300">{item.product_name} × {item.quantity}</span>
              <span className="text-white">${(item.price_usd * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-700 mt-3 pt-3 flex justify-between">
          <span className="text-slate-300 font-medium">Total</span>
          <span className="text-orange-400 font-black">${typedOrder.total_usd.toFixed(2)} USD</span>
        </div>
      </div>

      {typedOrder.payment_instructions && (
        <div className="bg-slate-800 border border-orange-900 rounded-xl p-4">
          <h2 className="font-bold text-orange-400 mb-2">Instrucciones de pago</h2>
          <p className="text-slate-300 text-sm whitespace-pre-wrap">{typedOrder.payment_instructions}</p>
        </div>
      )}
    </div>
  )
}
