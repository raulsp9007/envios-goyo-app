import { createServiceClient } from '@/lib/supabase/server'
import {
  saveShippingConfigAction,
  createProvinceAction,
  updateProvinceAction,
  deleteProvinceAction,
  createMunicipalityAction,
  updateMunicipalityAction,
  deleteMunicipalityAction,
} from './actions'
import ProvinceRow from './ProvinceRow'
import MunicipalityRow from './MunicipalityRow'
import type { Province, ShippingConfig } from '@/types'

export const dynamic = 'force-dynamic'

export default async function TransportePage({
  searchParams,
}: {
  searchParams: Promise<{ provincia?: string }>
}) {
  const params = await searchParams
  const selectedProvinceId = params.provincia ? Number(params.provincia) : null

  const supabase = createServiceClient()
  const [{ data: configData }, { data: provincesData }] = await Promise.all([
    supabase.from('shipping_config').select('*').eq('id', 1).single(),
    supabase.from('provinces').select('*, municipalities(*)').order('position'),
  ])

  const config = configData as ShippingConfig | null
  const provinces = (provincesData ?? []) as Province[]
  const selectedProvince = selectedProvinceId
    ? provinces.find(p => p.id === selectedProvinceId) ?? null
    : null

  return (
    <div className="max-w-5xl space-y-8">
      <h1 className="text-2xl font-bold">Transporte</h1>

      {/* Shipping config panel */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4">Configuración de envío</h2>
        <form action={saveShippingConfigAction} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Costo combustible (USD)</label>
            <input
              name="fuel_cost_usd"
              type="number"
              step="0.01"
              min="0"
              defaultValue={config?.fuel_cost_usd ?? 0}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            />
            <p className="text-xs text-slate-500 mt-1">Se suma al precio base + recargo del municipio en cada entrega</p>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                name="pickup_enabled"
                type="checkbox"
                defaultChecked={config?.pickup_enabled ?? true}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-sm text-slate-300">Recogida en local</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                name="delivery_enabled"
                type="checkbox"
                defaultChecked={config?.delivery_enabled ?? true}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-sm text-slate-300">Entrega a domicilio</span>
            </label>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Dirección de recogida</label>
            <input
              name="pickup_address"
              type="text"
              defaultValue={config?.pickup_address ?? ''}
              placeholder="Ej: Calle 23 #456, Vedado, La Habana"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            />
          </div>
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-lg text-sm transition"
          >
            Guardar configuración
          </button>
        </form>
      </div>

      {/* Provinces + Municipalities two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provinces panel */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="font-bold">Provincias</h2>
            <p className="text-xs text-slate-500 mt-0.5">Clic en nombre para ver sus municipios</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs">
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="text-right px-3 py-2">Precio base</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {provinces.map(p => (
                <ProvinceRow
                  key={p.id}
                  province={p}
                  isSelected={p.id === selectedProvinceId}
                  updateAction={updateProvinceAction}
                  deleteAction={deleteProvinceAction}
                />
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 font-medium mb-2">Agregar provincia</p>
            <form action={createProvinceAction} className="flex gap-2 flex-wrap">
              <input
                name="name"
                type="text"
                required
                placeholder="Nombre"
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm flex-1 min-w-28 focus:outline-none focus:border-orange-500"
              />
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-sm">$</span>
                <input
                  name="base_price_usd"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue="0"
                  placeholder="Precio base"
                  className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition"
              >
                + Agregar
              </button>
            </form>
          </div>
        </div>

        {/* Municipalities panel */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          {selectedProvince ? (
            <>
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h2 className="font-bold">Municipios — {selectedProvince.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Precio total: ${selectedProvince.base_price_usd.toFixed(2)} base + recargo + combustible
                  </p>
                </div>
                <a href="/admin/transporte" className="text-xs text-slate-400 hover:text-white">✕ Cerrar</a>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs">
                    <th className="text-left px-3 py-2">Nombre</th>
                    <th className="px-3 py-2">Recargo / Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedProvince.municipalities ?? []).map(m => (
                    <MunicipalityRow
                      key={m.id}
                      municipality={m}
                      updateAction={updateMunicipalityAction}
                      deleteAction={deleteMunicipalityAction}
                    />
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t border-slate-700">
                <p className="text-xs text-slate-400 font-medium mb-2">Agregar municipio</p>
                <form action={createMunicipalityAction} className="flex gap-2 flex-wrap">
                  <input type="hidden" name="province_id" value={selectedProvince.id} />
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Nombre municipio"
                    className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm flex-1 min-w-28 focus:outline-none focus:border-orange-500"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-sm">+$</span>
                    <input
                      name="surcharge_usd"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue="0"
                      placeholder="Recargo"
                      className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition"
                  >
                    + Agregar
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p>← Selecciona una provincia para ver sus municipios</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
