'use client'

import { useCart } from '@/context/CartContext'
import { createOrderAction } from './actions'
import { useEffect, useRef, useState } from 'react'

const REQUIRED_FIELDS = ['customer_name', 'customer_email', 'customer_phone', 'customer_address', 'customer_municipio'] as const

export default function CheckoutPage() {
  const { items, total, count, clearCart } = useCart()
  const cartRef = useRef(JSON.stringify(items))
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(REQUIRED_FIELDS.map(f => [f, '']))
  )

  useEffect(() => {
    cartRef.current = JSON.stringify(items)
  }, [items])

  const isValid = REQUIRED_FIELDS.every(f => values[f].trim())

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
    clearCart()
    await createOrderAction(formData)
  }

  function field(
    name: string,
    label: string,
    type = 'text',
    required = false
  ) {
    return (
      <div key={name}>
        <label className="block text-sm text-slate-300 mb-1">
          {label} {required && <span className="text-orange-400">*</span>}
        </label>
        <input
          name={name}
          type={type}
          required={required}
          value={required ? (values[name] ?? '') : undefined}
          onChange={required ? e => setValues(v => ({ ...v, [name]: e.target.value })) : undefined}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Tu información</h1>
        <p className="text-slate-500 text-xs mb-6">Los campos con <span className="text-orange-400">*</span> son obligatorios</p>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="cart" value={cartRef.current} />
          {field('customer_name', 'Nombre completo', 'text', true)}
          {field('customer_email', 'Email', 'email', true)}
          {field('customer_phone', 'Teléfono / WhatsApp', 'tel', true)}
          {field('customer_address', 'Dirección de entrega', 'text', true)}
          {field('customer_municipio', 'Municipio', 'text', true)}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nota (opcional)</label>
            <textarea
              name="customer_note"
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            />
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
          <div className="border-t border-slate-700 pt-3 flex justify-between">
            <span className="text-slate-300 font-medium">Total</span>
            <span className="text-orange-400 font-black">${total.toFixed(2)} USD</span>
          </div>
        </div>
      </div>
    </div>
  )
}
