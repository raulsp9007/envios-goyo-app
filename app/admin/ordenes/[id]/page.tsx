import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, type OrderStatus, type OrderWithItems } from '@/types'
import ProfitTable from '@/components/admin/ProfitTable'
import { advanceOrderStatusAction } from '../actions'
import StatusProgress from '@/components/store/StatusProgress'

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('orders')
    .select(`
      *, order_items (*)
    `)
    .eq('id', params.id)
    .single()

  if (!data) notFound()

  const order = data as unknown as OrderWithItems
  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status)
  const isCompleted = currentIndex === ORDER_STATUS_FLOW.length - 1

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orden #{order.order_number}</h1>
          <p className="text-slate-400 text-sm">
            {new Date(order.created_at).toLocaleString('es-ES')}
          </p>
        </div>
        {!isCompleted && (
          <form action={advanceOrderStatusAction.bind(null, order.id, order.status)}>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg text-sm"
            >
              Avanzar a: {ORDER_STATUS_LABELS[ORDER_STATUS_FLOW[currentIndex + 1]]}
            </button>
          </form>
        )}
      </div>

      <div className="mb-6">
        <StatusProgress status={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="font-bold text-white mb-3">Cliente</h2>
          <div className="space-y-1 text-sm">
            <p><span className="text-slate-400">Nombre:</span> <span className="text-white">{order.customer_name}</span></p>
            <p><span className="text-slate-400">Email:</span> <span className="text-white">{order.customer_email}</span></p>
            <p><span className="text-slate-400">Teléfono:</span> <span className="text-white">{order.customer_phone}</span></p>
            <p><span className="text-slate-400">Dirección:</span> <span className="text-white">{order.customer_address}</span></p>
            {order.customer_note && (
              <p><span className="text-slate-400">Nota:</span> <span className="text-white">{order.customer_note}</span></p>
            )}
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="font-bold text-white mb-3">Resumen financiero</h2>
          <div className="space-y-1 text-sm">
            <p><span className="text-slate-400">Total cobrado:</span> <span className="text-orange-400 font-bold">${order.total_usd.toFixed(2)} USD</span></p>
            <p><span className="text-slate-400">Tasa usada:</span> <span className="text-white">{order.exchange_rate_snapshot} CUP/USD</span></p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <h2 className="font-bold text-white mb-4">Detalle de ganancia</h2>
        <ProfitTable items={order.order_items} exchangeRate={order.exchange_rate_snapshot} />
      </div>
    </div>
  )
}
