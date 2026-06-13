import { CartProvider } from '@/context/CartContext'
import Link from 'next/link'
import CartNavButton from './CartNavButton'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-900 text-white">
        <nav className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center gap-4 sticky top-0 z-50">
          <Link href="/" className="font-bold text-orange-500 text-lg">🛒 Envios Goyo</Link>
          <Link href="/productos" className="text-sm text-slate-300 hover:text-white ml-4">Productos</Link>
          <div className="ml-auto">
            <CartNavButton />
          </div>
        </nav>
        <main>{children}</main>
      </div>
    </CartProvider>
  )
}
