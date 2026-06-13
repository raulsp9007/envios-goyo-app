'use client'

import { useCart } from '@/context/CartContext'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, count } = useCart()

  if (count === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 text-lg mb-4">Tu carrito está vacío</p>
        <Link href="/productos" className="text-orange-500 hover:underline">Ver productos</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Tu carrito</h1>
      <div className="space-y-3 mb-6">
        {items.map(item => (
          <div key={item.product_id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-medium text-white">{item.name}</p>
              <p className="text-orange-400 text-sm">${item.price_usd.toFixed(2)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                className="w-8 h-8 bg-slate-700 rounded-lg text-white font-bold hover:bg-slate-600"
              >−</button>
              <span className="w-8 text-center text-white">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                className="w-8 h-8 bg-slate-700 rounded-lg text-white font-bold hover:bg-slate-600"
              >+</button>
            </div>
            <p className="text-white font-bold w-16 text-right">
              ${(item.price_usd * item.quantity).toFixed(2)}
            </p>
            <button
              onClick={() => removeItem(item.product_id)}
              className="text-slate-500 hover:text-red-400 text-sm"
            >✕</button>
          </div>
        ))}
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex justify-between items-center mb-4">
        <span className="text-slate-300">Total</span>
        <span className="text-orange-400 font-black text-xl">${total.toFixed(2)} USD</span>
      </div>
      <Link
        href="/checkout"
        className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-center transition"
      >
        Continuar con el pedido →
      </Link>
    </div>
  )
}
