'use client'

import { useState, useMemo } from 'react'
import type { Product } from '@/types'
import ProductCard from './ProductCard'

interface Props {
  products: Product[]
  initialCategory?: string
}

export default function ProductsGrid({ products, initialCategory = '' }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory)

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort(),
    [products]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return products.filter(p => {
      const matchesCat = !category || p.category === category
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      return matchesCat && matchesSearch
    })
  }, [products, search, category])

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          type="search"
          placeholder="Buscar productos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-orange-500 placeholder:text-slate-500"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              !category
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat === category ? '' : cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                category === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      {(search || category) && (
        <p className="text-slate-400 text-sm mb-4">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          {search && <> para &ldquo;{search}&rdquo;</>}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-slate-400">No se encontraron productos</p>
          <button
            onClick={() => { setSearch(''); setCategory('') }}
            className="mt-3 text-orange-500 hover:underline text-sm"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
