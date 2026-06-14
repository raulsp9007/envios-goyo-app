import { createServiceClient } from '@/lib/supabase/server'
import ProductsGrid from '@/components/store/ProductsGrid'
import type { Product } from '@/types'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const supabase = createServiceClient()
  const params = await searchParams
  const initialCategory = typeof params.categoria === 'string' ? params.categoria : ''

  const { data } = await supabase
    .from('products')
    .select('id, name, category, price_usd, price_usd_sale, description, image_url, active, created_at')
    .eq('active', true)
    .order('category')
    .order('name')

  const products = (data ?? []) as Product[]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Productos</h1>
      <ProductsGrid products={products} initialCategory={initialCategory} />
    </div>
  )
}
