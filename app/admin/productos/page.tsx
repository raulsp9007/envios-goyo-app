import { createServiceClient } from '@/lib/supabase/server'
import { toggleProductAction } from './actions'
import Link from 'next/link'
import type { ProductWithCost } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('category')
    .order('name')

  const products = (data ?? []) as ProductWithCost[]

  const { data: rateRow } = await supabase
    .from('exchange_rate')
    .select('rate')
    .eq('id', 1)
    .single()
  const rate = rateRow?.rate ?? 600

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg text-sm"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left p-3">Producto</th>
              <th className="text-left p-3">Categoría</th>
              <th className="text-right p-3">Precio USD</th>
              <th className="text-right p-3">P. rebajado</th>
              <th className="text-right p-3">Costo CUP</th>
              <th className="text-right p-3">Ganancia est. %</th>
              <th className="text-center p-3">Activo</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const revenueCup = p.price_usd * rate
              const profitPct = revenueCup > 0
                ? Math.round(((revenueCup - p.cost_cup) / revenueCup) * 100)
                : 0
              return (
                <tr key={p.id} className="border-b border-slate-700 last:border-0">
                  <td className="p-3 text-white">{p.name}</td>
                  <td className="p-3 text-slate-400">{p.category}</td>
                  <td className="p-3 text-right text-orange-400">${p.price_usd.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    {p.price_usd_sale != null ? (
                      <span className="text-green-400">${p.price_usd_sale.toFixed(2)}</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="p-3 text-right text-slate-300">{p.cost_cup.toFixed(0)} CUP</td>
                  <td className="p-3 text-right">
                    <span className={profitPct > 0 ? 'text-green-400' : 'text-red-400'}>
                      {profitPct}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <form action={toggleProductAction.bind(null, p.id, !p.active)}>
                      <button
                        type="submit"
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          p.active
                            ? 'bg-green-900 text-green-300'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {p.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </form>
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/productos/${p.id}/editar`} className="text-xs text-orange-400 hover:underline">
                      Editar
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
