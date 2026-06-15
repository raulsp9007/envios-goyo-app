import { createServiceClient } from '@/lib/supabase/server'
import { updateSettingsAction } from './actions'

export const dynamic = 'force-dynamic'

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
        <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm text-slate-200 font-medium">Aprobar comprobantes automáticamente</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Si está activo, cuando el cliente sube su comprobante la orden pasa a <strong>En espera</strong> sin revisión manual.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
            <input
              type="checkbox"
              name="auto_approve_proof"
              defaultChecked={settings.auto_approve_proof === 'true'}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
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
