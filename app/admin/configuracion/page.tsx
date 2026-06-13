import { createServiceClient } from '@/lib/supabase/server'
import { updateSettingsAction } from './actions'

export default async function ConfigPage() {
  const supabase = createServiceClient()
  const { data } = await supabase.from('settings').select('*')
  const settings = Object.fromEntries((data ?? []).map(r => [r.key, r.value]))

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      <form action={updateSettingsAction} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Nombre del negocio</label>
          <input
            name="business_name"
            defaultValue={settings.business_name ?? 'Envios Goyo'}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Tagline</label>
          <input
            name="business_tagline"
            defaultValue={settings.business_tagline ?? ''}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Instrucciones de pago</label>
          <p className="text-xs text-slate-500 mb-1">Se muestra al cliente en la confirmación de orden y en el email.</p>
          <textarea
            name="payment_instructions"
            rows={5}
            defaultValue={settings.payment_instructions ?? ''}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
          />
        </div>
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg"
        >
          Guardar configuración
        </button>
      </form>
    </div>
  )
}
