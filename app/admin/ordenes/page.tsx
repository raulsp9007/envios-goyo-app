import { createServiceClient } from '@/lib/supabase/server'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'Todas', value: '' },
  { label: '⏳ Pendiente', value: 'pending_payment' },
  { label: '🔄 En espera', value: 'waiting' },
  { label: '⚙️ Procesando', value: 'processing' },
  { label: '🚚 Entregado', value: 'delivered' },
  { label: '✅ Completado', value: 'completed' },
]

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createServiceClient()

  let query = supabase
    .from('orders')
    .select('id, order_number, customer_name, customer_email, total_usd, status, created_at')
    .order('created_at', { ascending: false })

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  const { data: orders, error: ordersError } = await query

  if (ordersError) {
    console.error('[admin/ordenes] Supabase error:', ordersError)
  } else {
    console.log('[admin/ordenes] Query returned', orders?.length ?? 0, 'orders')
    orders?.forEach(o => console.log('  order:', o.id, 'order_number:', o.order_number, 'status:', o.status))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Órdenes</h1>

      {process.env.NODE_ENV !== 'production' ? null : (
        <p className="text-xs text-slate-500 mb-2">
          DB devolvió {orders?.length ?? 0} órdenes {ordersError ? `— ERROR: ${ordersError.message}` : ''}
        </p>
      )}

      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_FILTERS.map(f => (
          <Link
            key={f.value}
            href={f.value ? `/admin/ordenes?status=${f.value}` : '/admin/ordenes'}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              searchParams.status === f.value || (!searchParams.status && f.value === '')
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left p-3">#</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Fecha</th>
              <th className="text-right p-3">Total USD</th>
              <th className="text-left p-3">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map(order => (
              <tr key={order.id} className="border-b border-slate-700 last:border-0">
                <td className="p-3 text-slate-400">#{order.order_number}</td>
                <td className="p-3 text-white">{order.customer_name}</td>
                <td className="p-3 text-slate-400">
                  {new Date(order.created_at).toLocaleDateString('es-ES')}
                </td>
                <td className="p-3 text-right text-orange-400">${order.total_usd.toFixed(2)}</td>
                <td className="p-3">
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">
                    {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                  </span>
                </td>
                <td className="p-3">
                  <Link href={`/admin/ordenes/${order.id}`} className="text-orange-500 hover:underline text-xs">
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
            {!orders?.length && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">No hay órdenes</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
