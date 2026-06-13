import { createServiceClient } from '@/lib/supabase/server'
import ProductCard from '@/components/store/ProductCard'
import type { Product } from '@/types'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const supabase = createServiceClient()
  const params = await searchParams
  const categoria = typeof params.categoria === 'string' ? params.categoria : undefined

  const { data: products } = await supabase
    .from('products')
    .select('id, name, category, price_usd, description, image_url, active, created_at')
    .eq('active', true)
    .order('category')
    .order('name')

  const all = (products ?? []) as Product[]

  const categories = Array.from(new Set(all.map(p => p.category).filter(Boolean))).sort()

  const filtered = categoria
    ? all.filter(p => p.category === categoria)
    : all

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Productos</h1>

      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <a
            href="/productos"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              !categoria
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Todos
          </a>
          {categories.map(cat => (
            <a
              key={cat}
              href={`/productos?categoria=${encodeURIComponent(cat)}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                categoria === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {cat}
            </a>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-slate-400">No hay productos disponibles.</p>
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
