'use client'
import type { Product } from '@/types'
import { useCart } from '@/context/CartContext'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart()
  const cartItem = items.find(i => i.product_id === product.id)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="w-full h-32 object-cover rounded-lg" />
      ) : (
        <div className="w-full h-32 bg-slate-700 rounded-lg flex items-center justify-center text-3xl">🛒</div>
      )}
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide">{product.category}</p>
        <h3 className="font-semibold text-white">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{product.description}</p>
        )}
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-orange-400 font-bold text-lg">${product.price_usd.toFixed(2)}</span>
        {cartItem ? (
          <span className="text-green-400 text-sm font-medium">✓ En carrito ({cartItem.quantity})</span>
        ) : (
          <button
            onClick={() => addItem({ product_id: product.id, name: product.name, price_usd: product.price_usd })}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg text-sm transition"
          >
            + Agregar
          </button>
        )}
      </div>
    </div>
  )
}
