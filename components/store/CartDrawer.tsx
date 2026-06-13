'use client'

import { useCart } from '@/context/CartContext'

export default function CartDrawer() {
  const { items, count, total, isOpen, closeCart, removeItem, updateQuantity } = useCart()

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-96 max-w-[92vw] bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h2 className="font-bold text-white">
            Carrito {count > 0 && <span className="text-orange-400">({count})</span>}
          </h2>
          <button
            onClick={closeCart}
            className="text-slate-400 hover:text-white text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🛒</p>
              <p className="text-slate-400">Tu carrito está vacío</p>
              <button
                onClick={closeCart}
                className="mt-4 text-orange-500 hover:underline text-sm"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product_id} className="flex items-center gap-3 bg-slate-800 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                  <p className="text-orange-400 text-sm font-bold">
                    ${(item.price_usd * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-slate-500 text-xs">${item.price_usd.toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-7 h-7 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold flex items-center justify-center transition"
                  >
                    −
                  </button>
                  <span className="text-white text-sm w-5 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-7 h-7 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold flex items-center justify-center transition"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="ml-1 text-slate-500 hover:text-red-400 transition text-sm"
                    aria-label="Eliminar"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-700 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Total</span>
              <span className="text-orange-400 font-black text-xl">${total.toFixed(2)} USD</span>
            </div>
            <a
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-center transition"
            >
              Ir al checkout →
            </a>
          </div>
        )}
      </div>
    </>
  )
}
