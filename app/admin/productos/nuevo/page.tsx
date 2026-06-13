import Link from 'next/link'
import { createProductAction } from '../actions'

const CATEGORIES = ['Carnes', 'Granos', 'Despensa', 'Lácteos', 'Bebidas', 'Aseo', 'Viandas', 'Combos', 'Otros']

interface FieldDef {
  name: string
  label: string
  type: string
  step?: string
  required?: boolean
}

export default function NewProductPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Nuevo producto</h1>
      {searchParams.error && (
        <p className="text-red-400 text-sm mb-4">{searchParams.error}</p>
      )}
      <form action={createProductAction} className="space-y-4">
        {([
          { name: 'name', label: 'Nombre', type: 'text', required: true },
          { name: 'price_usd', label: 'Precio venta (USD)', type: 'number', step: '0.01', required: true },
          { name: 'cost_cup', label: 'Costo (CUP)', type: 'number', step: '0.01', required: true },
          { name: 'description', label: 'Descripción', type: 'text' },
          { name: 'image_url', label: 'URL de imagen', type: 'url' },
        ] as FieldDef[]).map(f => (
          <div key={f.name}>
            <label className="block text-sm text-slate-300 mb-1">{f.label}</label>
            <input
              name={f.name}
              type={f.type}
              step={f.step}
              required={f.required}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Categoría</label>
          <select
            name="category"
            required
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
          >
            <option value="">Selecciona...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg"
          >
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
