import { createServiceClient } from '@/lib/supabase/server'
import ProductCard from '@/components/store/ProductCard'
import ProductsGrid from '@/components/store/ProductsGrid'
import { HomeSearchBar } from '@/components/store/HomeSearchBar'
import { Logo } from '@/components/Logo'
import Link from 'next/link'
import type { Product } from '@/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createServiceClient()

  const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, category, price_usd, price_usd_sale, description, image_url, active, created_at')
      .eq('active', true)
      .order('category')
      .order('name'),
    supabase
      .from('categories')
      .select('name, emoji')
      .order('position'),
  ])

  const products = (productsData ?? []) as Product[]
  const productCategorySet = new Set(products.map(p => p.category))
  const categoryList = (categoriesData ?? []).filter(c => productCategorySet.has(c.name))
  const dealProducts = products
    .filter(p => p.price_usd_sale != null && p.price_usd_sale < p.price_usd)
    .slice(0, 4)

  return (
    <div>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-14 pb-10 text-center">
        <Logo className="w-52 h-auto text-white mb-4" />
        <p className="text-slate-400 text-base mb-6 max-w-xs">
          Tu mercado cubano desde el exterior
        </p>
        <HomeSearchBar />
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {categoryList.map(cat => (
            <Link
              key={cat.name}
              href={`/productos?categoria=${encodeURIComponent(cat.name)}`}
              className="bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 text-xs px-3 py-1.5 rounded-full transition"
            >
              {cat.emoji} {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Ofertas del día */}
      {dealProducts.length > 0 && (
        <section className="px-4 mb-12 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              Ofertas del día
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full align-middle">
                -{Math.round((1 - dealProducts[0].price_usd_sale! / dealProducts[0].price_usd) * 100)}% y más
              </span>
            </h2>
            <Link href="/productos" className="text-orange-400 text-sm hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {dealProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Cómo funciona */}
      <section className="px-4 mb-12 max-w-4xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-8 text-center">¿Cómo funciona?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              n: '1',
              title: 'Elige tus productos',
              desc: 'Navega el catálogo y agrega lo que necesita tu familia al carrito.',
            },
            {
              n: '2',
              title: 'Paga en USD online',
              desc: 'Pago seguro desde cualquier país. Aceptamos tarjeta y más.',
            },
            {
              n: '3',
              title: 'Llega a Cuba',
              desc: 'Entregamos en 3–5 días directamente a la dirección indicada en Cuba.',
            },
          ].map(step => (
            <div key={step.n} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl mb-3 shrink-0">
                {step.n}
              </div>
              <h3 className="text-white font-semibold mb-1">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Todos los productos */}
      <section id="productos" className="px-4 pb-16 max-w-6xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-4">Todos los productos</h2>
        {products.length === 0 ? (
          <p className="text-slate-400">No hay productos disponibles.</p>
        ) : (
          <ProductsGrid products={products} />
        )}
      </section>
    </div>
  )
}
