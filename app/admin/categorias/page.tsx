import { createServiceClient } from '@/lib/supabase/server'
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from './actions'
import CategoryRow from './CategoryRow'

export default async function CategoriasPage() {
  const supabase = createServiceClient()

  const [{ data: categories }, { data: productCounts }] = await Promise.all([
    supabase.from('categories').select('*').order('position'),
    supabase.from('products').select('category').eq('active', true),
  ])

  // Count products per category
  const countMap = new Map<string, number>()
  ;(productCounts ?? []).forEach(p => {
    countMap.set(p.category, (countMap.get(p.category) ?? 0) + 1)
  })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Categorías</h1>

      {/* Category list */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden mb-8">
        {!categories?.length ? (
          <p className="p-6 text-center text-slate-400">No hay categorías. Agrega una abajo.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wide">
                <th className="p-3 text-left">Emoji</th>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-right">Productos</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  productCount={countMap.get(cat.name) ?? 0}
                  updateAction={updateCategoryAction}
                  deleteAction={deleteCategoryAction}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add new category */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-base font-bold mb-4">Nueva categoría</h2>
        <form action={createCategoryAction} className="flex gap-3 items-end">
          <div className="w-20">
            <label className="block text-xs text-slate-400 mb-1">Emoji</label>
            <input
              name="emoji"
              type="text"
              defaultValue="📦"
              required
              maxLength={8}
              className="w-full bg-slate-900 border border-slate-600 text-white text-center text-xl rounded-lg px-2 py-2 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">Nombre</label>
            <input
              name="name"
              type="text"
              required
              placeholder="Ej: Especias"
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            />
          </div>
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-lg transition shrink-0"
          >
            + Agregar
          </button>
        </form>
      </div>
    </div>
  )
}
