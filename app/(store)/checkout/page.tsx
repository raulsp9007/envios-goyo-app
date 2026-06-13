'use client'

import { useCart } from '@/context/CartContext'
import { createOrderAction } from './actions'
import { useEffect, useRef } from 'react'

export default function CheckoutPage() {
  const { items, total, count, clearCart } = useCart()
  const cartRef = useRef(JSON.stringify(items))

  useEffect(() => {
    cartRef.current = JSON.stringify(items)
  }, [items])

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Tu información</h1>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="cart" value={cartRef.current} />
          {[
            { name: 'customer_name', label: 'Nombre completo', type: 'text', required: true },
            { name: 'customer_email', label: 'Email', type: 'email', required: true },
            { name: 'customer_phone', label: 'Teléfono / WhatsApp', type: 'tel', required: true },
            { name: 'customer_address', label: 'Dirección de entrega en Cuba', type: 'text', required: true },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm text-slate-300 mb-1">{field.label}</label>
              <input
                name={field.name}
                type={field.type}
                required={field.required}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
          ))}
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
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition"
          >
            Confirmar pedido
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
