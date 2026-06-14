import Link from 'next/link'
import { createProductAction } from '../actions'
import { createServiceClient } from '@/lib/supabase/server'
import { ProductPricingSection } from '../ProductPricingSection'

export const dynamic = 'force-dynamic'

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = createServiceClient()
  const [{ data: categories }, { data: rateRow }] = await Promise.all([
    supabase.from('categories').select('name, emoji').order('position'),
    supabase.from('exchange_rate').select('rate').eq('id', 1).single(),
  ])
  const rate = rateRow?.rate ?? 600

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Nuevo producto</h1>
      {params.error && (
        <p className="text-red-400 text-sm mb-4">{params.error}</p>
      )}
      <form action={createProductAction} encType="multipart/form-data" className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Nombre *</label>
          <input name="name" type="text" required
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Categoría *{' '}
            <Link href="/admin/categorias" className="text-xs text-orange-400 hover:underline ml-1">
              Gestionar categorías →
            </Link>
          </label>
          <select name="category" required
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500">
            <option value="">Selecciona...</option>
            {(categories ?? []).map(c => (
              <option key={c.name} value={c.name}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </div>

        <ProductPricingSection
          initialPriceUsd={0}
          initialCostCup={0}
          currentSalePrice={null}
          rate={rate}
        />

        <div>
          <label className="block text-sm text-slate-300 mb-1">Descripción</label>
          <input name="description" type="text"
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
        </div>

        {/* Image */}
        <div className="border border-slate-700 rounded-xl p-4 space-y-3">
          <p className="text-sm text-slate-300 font-medium">Imagen del producto</p>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Subir archivo</label>
            <input name="image_file" type="file" accept="image/*"
              className="w-full text-sm text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-500 file:text-white hover:file:bg-orange-600 file:cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">O pegar URL de imagen</label>
            <input name="image_url" type="url" placeholder="https://..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 text-sm" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg transition">
            Guardar
          </button>
          <Link href="/admin/productos" className="text-slate-400 hover:text-white px-4 py-2">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
