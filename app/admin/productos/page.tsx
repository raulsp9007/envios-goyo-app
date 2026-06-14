import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProductsTable from './ProductsTable'
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

      <ProductsTable products={products} rate={rate} />
    </div>
  )
}
