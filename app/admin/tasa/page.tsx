import { createServiceClient } from '@/lib/supabase/server'
import { updateRateAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function TasaPage() {
  const supabase = createServiceClient()
  const { data } = await supabase.from('exchange_rate').select('*').eq('id', 1).single()

  return (
    <div className="max-w-sm">
      <h1 className="text-2xl font-bold mb-2">Tasa de cambio</h1>
      <p className="text-slate-400 text-sm mb-6">
        Última actualización: {data ? new Date(data.updated_at).toLocaleString('es-ES') : '—'}
      </p>
      <form action={updateRateAction} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">CUP por 1 USD</label>
          <input
            name="rate"
            type="number"
            step="0.01"
            defaultValue={data?.rate ?? 600}
            required
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xl font-bold focus:outline-none focus:border-orange-500"
          />
        </div>
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg"
        >
          Actualizar tasa
        </button>
      </form>
      <p className="text-slate-500 text-xs mt-4">
        Solo afecta órdenes nuevas. Las órdenes existentes conservan la tasa del momento en que se crearon.
      </p>
    </div>
  )
}
