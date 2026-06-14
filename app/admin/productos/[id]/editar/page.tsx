import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateProductAction } from '../../actions'
import { ProductPricingSection } from '../../ProductPricingSection'
import type { ProductWithCost } from '@/types'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = params
  const { error } = await searchParams

  const supabase = createServiceClient()
  const [{ data: product }, { data: categories }, { data: rateRow }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('name').order('position'),
    supabase.from('exchange_rate').select('rate').eq('id', 1).single(),
  ])
  const rate = rateRow?.rate ?? 600

  if (!product) notFound()

  const p = product as ProductWithCost

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/productos" className="text-slate-400 hover:text-white text-sm">← Volver</Link>
        <h1 className="text-2xl font-bold">Editar producto</h1>
      </div>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <form action={updateProductAction.bind(null, id)} encType="multipart/form-data" className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Nombre *</label>
          <input name="name" type="text" required defaultValue={p.name}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Categoría *{' '}
            <Link href="/admin/categorias" className="text-xs text-orange-400 hover:underline ml-1">
              Gestionar categorías →
            </Link>
          </label>
          <select name="category" required defaultValue={p.category}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
            <option value="">Selecciona...</option>
            {(categories ?? []).map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <ProductPricingSection
          initialPriceUsd={p.price_usd}
          initialCostCup={p.cost_cup}
          currentSalePrice={p.price_usd_sale}
          rate={rate}
        />
        <div>
          <label className="block text-sm text-slate-300 mb-1">Descripción</label>
          <input name="description" type="text" defaultValue={p.description ?? ''}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
        </div>
        <div className="border border-slate-700 rounded-xl p-4 space-y-3">
          <p className="text-sm text-slate-300 font-medium">Imagen del producto</p>
          {p.image_url && (
            <img src={p.image_url} alt={p.name} className="w-24 h-24 object-cover rounded-lg" />
          )}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Subir nueva imagen</label>
            <input name="image_file" type="file" accept="image/*"
              className="w-full text-sm text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-500 file:text-white hover:file:bg-orange-600 file:cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">O pegar URL de imagen</label>
            <input name="image_url" type="url" defaultValue={p.image_url ?? ''} placeholder="https://..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 text-sm" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg transition">
            Guardar cambios
          </button>
          <Link href="/admin/productos" className="text-slate-400 hover:text-white px-4 py-2">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
