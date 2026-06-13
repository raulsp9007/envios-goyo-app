'use client'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function CartNavButton() {
  const { count, total } = useCart()
  return (
    <Link
      href="/carrito"
      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg text-sm transition"
    >
      🛒 {count > 0 && <span>{count}</span>}
      <span>${total.toFixed(2)}</span>
    </Link>
  )
}
