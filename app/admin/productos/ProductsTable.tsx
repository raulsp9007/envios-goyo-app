'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toggleProductAction } from './actions'
import DeleteProductButton from './DeleteProductButton'
import type { ProductWithCost } from '@/types'

type ActiveFilter = 'todos' | 'activos' | 'inactivos'
type SortKey = 'name' | 'cost_cup' | 'profit'
type SortDir = 'asc' | 'desc'

export default function ProductsTable({
  products,
  rate,
}: {
  products: ProductWithCost[]
  rate: number
}) {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('todos')
  const [minCost, setMinCost] = useState('')
  const [maxCost, setMaxCost] = useState('')
  const [minProfit, setMinProfit] = useState('')
  const [maxProfit, setMaxProfit] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const enriched = products.map(p => {
    const effectivePrice = (p.price_usd_sale != null && p.price_usd_sale < p.price_usd)
      ? p.price_usd_sale : p.price_usd
    const revenueCup = effectivePrice * rate
    const profitCup = Math.round(revenueCup - p.cost_cup)
    const profitPct = revenueCup > 0
      ? Math.round(((revenueCup - p.cost_cup) / revenueCup) * 100) : 0
    return { ...p, effectivePrice, revenueCup, profitCup, profitPct }
  })

  const filtered = enriched.filter(p => {
    if (query.trim() &&
      !p.name.toLowerCase().includes(query.toLowerCase()) &&
      !p.category.toLowerCase().includes(query.toLowerCase())) return false
    if (activeFilter === 'activos' && !p.active) return false
    if (activeFilter === 'inactivos' && p.active) return false
    if (minCost !== '' && p.cost_cup < Number(minCost)) return false
    if (maxCost !== '' && p.cost_cup > Number(maxCost)) return false
    if (minProfit !== '' && p.profitCup < Number(minProfit)) return false
    if (maxProfit !== '' && p.profitCup > Number(maxProfit)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
    else if (sortKey === 'cost_cup') cmp = a.cost_cup - b.cost_cup
    else if (sortKey === 'profit') cmp = a.profitCup - b.profitCup
    return sortDir === 'asc' ? cmp : -cmp
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sortIcon = (key: SortKey) =>
    sortKey !== key ? ' ↕' : sortDir === 'asc' ? ' ↑' : ' ↓'

  const hasFilters = query || activeFilter !== 'todos' || minCost || maxCost || minProfit || maxProfit

  function clearFilters() {
    setQuery(''); setActiveFilter('todos')
    setMinCost(''); setMaxCost(''); setMinProfit(''); setMaxProfit('')
  }

  const inputCls = 'bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500'

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <p className="text-xs text-slate-500 mb-1">Nombre / Categoría</p>
          <input
            type="search"
            placeholder="Buscar…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className={`${inputCls} w-48`}
          />
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1">Estado</p>
          <select
            value={activeFilter}
            onChange={e => setActiveFilter(e.target.value as ActiveFilter)}
            className={inputCls}
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1">Costo CUP</p>
          <div className="flex items-center gap-1">
            <input
              type="number"
              placeholder="Mín"
              value={minCost}
              onChange={e => setMinCost(e.target.value)}
              className={`${inputCls} w-24`}
            />
            <span className="text-slate-500 text-xs">–</span>
            <input
              type="number"
              placeholder="Máx"
              value={maxCost}
              onChange={e => setMaxCost(e.target.value)}
              className={`${inputCls} w-24`}
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1">Ganancia CUP</p>
          <div className="flex items-center gap-1">
            <input
              type="number"
              placeholder="Mín"
              value={minProfit}
              onChange={e => setMinProfit(e.target.value)}
              className={`${inputCls} w-24`}
            />
            <span className="text-slate-500 text-xs">–</span>
            <input
              type="number"
              placeholder="Máx"
              value={maxProfit}
              onChange={e => setMaxProfit(e.target.value)}
              className={`${inputCls} w-24`}
            />
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-slate-400 hover:text-white underline pb-1.5"
          >
            Limpiar filtros
          </button>
        )}

        <span className="text-xs text-slate-500 pb-1.5 ml-auto">
          {sorted.length} de {products.length} productos
        </span>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th
                className="text-left p-3 cursor-pointer hover:text-white select-none"
                onClick={() => toggleSort('name')}
              >
                Producto{sortIcon('name')}
              </th>
              <th className="text-left p-3">Categoría</th>
              <th className="text-right p-3">Precio USD</th>
              <th className="text-right p-3">P. rebajado</th>
              <th
                className="text-right p-3 cursor-pointer hover:text-white select-none"
                onClick={() => toggleSort('cost_cup')}
              >
                Costo CUP{sortIcon('cost_cup')}
              </th>
              <th
                className="text-right p-3 cursor-pointer hover:text-white select-none"
                onClick={() => toggleSort('profit')}
              >
                Ganancia CUP{sortIcon('profit')}
              </th>
              <th className="text-right p-3">Margen %</th>
              <th className="text-center p-3">Activo</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500">
                  No hay productos que coincidan con los filtros aplicados
                </td>
              </tr>
            ) : (
              sorted.map(p => {
                const isProfit = p.profitCup > 0
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
                        {p.profitCup.toLocaleString()} CUP
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={isProfit ? 'text-green-400' : 'text-red-400'}>
                        {p.profitPct}%
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
