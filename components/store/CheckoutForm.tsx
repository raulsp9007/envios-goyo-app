'use client'

import { useCart } from '@/context/CartContext'
import { createOrderAction } from '@/app/(store)/checkout/actions'
import { useEffect, useRef, useState } from 'react'
import type { Province, ShippingConfig } from '@/types'

interface Props {
  provinces: Province[]
  shippingConfig: ShippingConfig
}

export default function CheckoutForm({ provinces, shippingConfig }: Props) {
  const { items, total, count, clearCart } = useCart()
  const cartRef = useRef(JSON.stringify(items))

  const enabledMethods = [
    ...(shippingConfig.pickup_enabled ? ['pickup' as const] : []),
    ...(shippingConfig.delivery_enabled ? ['delivery' as const] : []),
  ]

  const [method, setMethod] = useState<'pickup' | 'delivery'>(enabledMethods[0] ?? 'delivery')
  const [provinceId, setProvinceId] = useState<number | ''>('')
  const [municipalityId, setMunicipalityId] = useState<number | ''>('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => { cartRef.current = JSON.stringify(items) }, [items])

  const selectedProvince = provinceId ? provinces.find(p => p.id === provinceId) : null
  const filteredMunicipalities = selectedProvince?.municipalities ?? []
  const selectedMunicipality = municipalityId
    ? filteredMunicipalities.find(m => m.id === municipalityId)
    : null

  const shippingCost = method === 'pickup' ? 0
    : selectedMunicipality && selectedProvince
      ? selectedProvince.base_price_usd + selectedMunicipality.surcharge_usd + shippingConfig.fuel_cost_usd
      : 0

  const grandTotal = total + shippingCost

  const isValid = (() => {
    if (!name.trim() || !email.trim() || !phone.trim()) return false
    if (method === 'delivery' && (!address.trim() || !municipalityId)) return false
    return true
  })()

  if (count === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 mb-4">Tu carrito está vacío</p>
        <a href="/productos" className="text-orange-500 hover:underline">Ver productos</a>
      </div>
    )
  }

  async function handleSubmit(formData: FormData) {
    formData.set('cart', cartRef.current)
    formData.set('shipping_method', method)
    if (method === 'delivery' && municipalityId) {
      formData.set('municipality_id', String(municipalityId))
    }
    clearCart()
    await createOrderAction(formData)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Tu información</h1>
        <p className="text-slate-500 text-xs mb-6">
          Los campos con <span className="text-orange-400">*</span> son obligatorios
        </p>

        <form action={handleSubmit} className="space-y-4">
          {enabledMethods.length > 1 && (
            <div>
              <label className="block text-sm text-slate-300 mb-2">Método de envío *</label>
              <div className="flex gap-2">
                {shippingConfig.pickup_enabled && (
                  <button
                    type="button"
                    onClick={() => setMethod('pickup')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition ${
                      method === 'pickup'
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    🏠 Recogida en local
                  </button>
                )}
                {shippingConfig.delivery_enabled && (
                  <button
                    type="button"
                    onClick={() => setMethod('delivery')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition ${
                      method === 'delivery'
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    🚚 Entrega a domicilio
                  </button>
                )}
              </div>
            </div>
          )}

          {method === 'pickup' && shippingConfig.pickup_address && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm">
              <span className="text-slate-400">📍 Recoge en: </span>
              <span className="text-white font-medium">{shippingConfig.pickup_address}</span>
            </div>
          )}

          {method === 'delivery' && (
            <>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Dirección completa <span className="text-orange-400">*</span></label>
                <input
                  name="customer_address"
                  type="text"
                  required
                  placeholder="Calle, número, entre calles, reparto..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Provincia</label>
                <select
                  value={provinceId}
                  onChange={e => {
                    setProvinceId(Number(e.target.value) || '')
                    setMunicipalityId('')
                  }}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                >
                  <option value="">Selecciona provincia...</option>
                  {provinces.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Municipio <span className="text-orange-400">*</span></label>
                <select
                  name="municipality_id"
                  value={municipalityId}
                  onChange={e => setMunicipalityId(Number(e.target.value) || '')}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                >
                  <option value="">
                    {provinceId ? 'Selecciona municipio...' : 'Primero selecciona una provincia'}
                  </option>
                  {filteredMunicipalities.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm text-slate-300 mb-1">Nombre completo <span className="text-orange-400">*</span></label>
            <input name="customer_name" type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email <span className="text-orange-400">*</span></label>
            <input name="customer_email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Teléfono / WhatsApp <span className="text-orange-400">*</span></label>
            <input name="customer_phone" type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nota (opcional)</label>
            <textarea name="customer_note" rows={2}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500" />
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition"
          >
            {isValid ? 'Confirmar pedido' : 'Completa los campos obligatorios'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-4">Resumen</h2>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          {items.map(item => (
            <div key={item.product_id} className="flex justify-between text-sm">
              <span className="text-slate-300">{item.name} × {item.quantity}</span>
              <span className="text-white">${(item.price_usd * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-slate-700 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Envío</span>
              <span className="text-white">
                {method === 'pickup'
                  ? 'Gratis'
                  : shippingCost > 0
                    ? `$${shippingCost.toFixed(2)}`
                    : '—'}
              </span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t border-slate-700">
              <span className="text-slate-300">Total</span>
              <span className="text-orange-400 font-black">${grandTotal.toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        {method === 'delivery' && selectedProvince && selectedMunicipality && (
          <p className="mt-2 text-xs text-slate-500">
            Envío: ${selectedProvince.base_price_usd.toFixed(2)} base + ${selectedMunicipality.surcharge_usd.toFixed(2)} recargo {shippingConfig.fuel_cost_usd > 0 ? `+ $${shippingConfig.fuel_cost_usd.toFixed(2)} combustible` : ''}
          </p>
        )}
      </div>
    </div>
  )
}
