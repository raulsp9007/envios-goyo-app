'use client'
import { useCart } from '@/context/CartContext'

export default function CartNavButton() {
  const { count, total, openCart } = useCart()
  return (
    <button
      onClick={openCart}
      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg text-sm transition"
    >
      🛒 {count > 0 && <span className="bg-white text-orange-600 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">{count}</span>}
      <span>${total.toFixed(2)}</span>
    </button>
  )
}
