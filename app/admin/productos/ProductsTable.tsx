'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toggleProductAction } from './actions'
import DeleteProductButton from './DeleteProductButton'
import type { ProductWithCost } from '@/types'

export default function ProductsTable({
  products,
  rate,
}: {
  products: ProductWithCost[]
  rate: number
}) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : products

  return (
    <div>
      <input
        type="search"
        placeholder="Buscar por nombre o categoría…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full max-w-sm bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:border-orange-500"
      />

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left p-3">Producto</th>
              <th className="text-left p-3">Categoría</th>
              <th className="text-right p-3">Precio USD</th>
              <th className="text-right p-3">P. rebajado</th>
              <th className="text-right p-3">Costo CUP</th>
              <th className="text-right p-3">Ganancia CUP</th>
              <th className="text-right p-3">Margen %</th>
              <th className="text-center p-3">Activo</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500">
                  No hay productos que coincidan con &quot;{query}&quot;
                </td>
              </tr>
            ) : (
              filtered.map(p => {
                const revenueCup = p.price_usd * rate
                const profitCup = Math.round(revenueCup - p.cost_cup)
                const profitPct = revenueCup > 0
                  ? Math.round(((revenueCup - p.cost_cup) / revenueCup) * 100)
                  : 0
                const isProfit = profitCup > 0
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
                      <span className={isProfit ? 'text-green-400' : 'text-red-400'}>
                        {profitCup.toLocaleString()} CUP
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={isProfit ? 'text-green-400' : 'text-red-400'}>
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
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/productos/${p.id}/editar`} className="text-xs text-orange-400 hover:underline">
                          Editar
                        </Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
