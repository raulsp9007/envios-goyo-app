import { createServiceClient } from '@/lib/supabase/server'
import ProductCard from '@/components/store/ProductCard'
import { Logo } from '@/components/Logo'
import type { Product } from '@/types'

export default async function HomePage() {
  const supabase = createServiceClient()

  const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, category, price_usd, description, image_url, active, created_at')
      .eq('active', true)
      .order('category')
      .order('name'),
    supabase
      .from('categories')
      .select('name, emoji')
      .order('position'),
  ])

  const products = (productsData ?? []) as Product[]

  // Build category display list (only categories that have active products)
  const productCategorySet = new Set(products.map(p => p.category))
  const categoryList = (categoriesData ?? []).filter(c => productCategorySet.has(c.name))

  return (
    <div>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-14 pb-10 text-center">
        <Logo className="w-52 h-auto text-white mb-5" />
        <p className="text-slate-400 text-base mb-7 max-w-xs">
          Tu mercado cubano desde el exterior
        </p>
        <a
          href="#productos"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl text-base transition"
        >
          Ver productos
        </a>
      </section>

      {/* Categories */}
      {categoryList.length > 0 && (
        <section className="px-4 mb-10 max-w-6xl mx-auto">
          <h2 className="text-lg font-bold text-white mb-3">Categorías</h2>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {categoryList.map(cat => {
              const count = products.filter(p => p.category === cat.name).length
              return (
                <a
                  key={cat.name}
                  href={`/productos?categoria=${encodeURIComponent(cat.name)}`}
                  className="flex-shrink-0 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 min-w-[110px] text-center transition"
                >
                  <div className="text-2xl mb-1">{cat.emoji}</div>
                  <div className="text-white text-sm font-semibold">{cat.name}</div>
                  <div className="text-slate-400 text-xs mt-0.5">
                    {count} {count === 1 ? 'producto' : 'productos'}
                  </div>
                </a>
              )
            })}
          </div>
        </section>
      )}

      {/* Products */}
      <section id="productos" className="px-4 pb-16 max-w-6xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-4">Todos los productos</h2>
        {products.length === 0 ? (
          <p className="text-slate-400">No hay productos disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
