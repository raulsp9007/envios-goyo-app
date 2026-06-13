import { createServiceClient } from '@/lib/supabase/server'
import { calculateOrderProfit } from '@/lib/profit'
import Link from 'next/link'
import type { OrderStatus, OrderItem } from '@/types'
import { ORDER_STATUS_LABELS } from '@/types'

export default async function AdminDashboard() {
  const supabase = createServiceClient()

  // Pending orders count
  const { count: pendingCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_payment')

  // Today's orders with items (for profit calc)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: todayOrders } = await supabase
    .from('orders')
    .select('id, total_usd, exchange_rate_snapshot, order_items(price_usd, cost_cup, quantity, product_name)')
    .gte('created_at', todayStart.toISOString())

  const todayRevenue = (todayOrders ?? []).reduce((s, o) => s + Number(o.total_usd), 0)

  const todayProfit = (todayOrders ?? []).reduce((s, o) => {
    if (!o.order_items?.length) return s
    const items = (o.order_items as unknown as OrderItem[]).map(i => ({
      product_name: i.product_name,
      quantity: i.quantity,
      price_usd: i.price_usd,
      cost_cup: i.cost_cup,
      exchange_rate: Number(o.exchange_rate_snapshot),
    }))
    return s + calculateOrderProfit(items).total_profit_cup
  }, 0)

  const { data: rateRow } = await supabase.from('exchange_rate').select('rate').eq('id', 1).single()
  const rate = Number(rateRow?.rate ?? 600)

  // Recent 5 orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, total_usd, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800 border border-orange-900 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Pendientes a pago</p>
          <p className="text-3xl font-black text-orange-500 mt-1">{pendingCount ?? 0}</p>
          <Link href="/admin/ordenes?status=pending_payment" className="text-xs text-slate-400 hover:text-white mt-1 block">
            Ver →
          </Link>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Ingresos hoy (USD)</p>
          <p className="text-3xl font-black text-white mt-1">${todayRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Ganancia hoy (CUP)</p>
          <p className="text-3xl font-black text-green-400 mt-1">{todayProfit.toFixed(0)}</p>
          <p className="text-xs text-slate-500">~${(todayProfit / rate).toFixed(2)} USD</p>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-3">Órdenes recientes</h2>
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {(recentOrders ?? []).map(o => (
              <tr key={o.id} className="border-b border-slate-700 last:border-0">
                <td className="p-3 text-slate-400">#{o.order_number}</td>
                <td className="p-3 text-white">{o.customer_name}</td>
                <td className="p-3 text-right text-orange-400">${Number(o.total_usd).toFixed(2)}</td>
                <td className="p-3">
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-slate-300">
                    {ORDER_STATUS_LABELS[o.status as OrderStatus]}
                  </span>
                </td>
                <td className="p-3">
                  <Link href={`/admin/ordenes/${o.id}`} className="text-orange-500 hover:underline text-xs">Ver →</Link>
                </td>
              </tr>
            ))}
            {!recentOrders?.length && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">No hay órdenes aún</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
