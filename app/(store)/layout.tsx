import { CartProvider } from '@/context/CartContext'
import Link from 'next/link'
import CartNavButton from './CartNavButton'
import CartDrawer from '@/components/store/CartDrawer'
import { Logo } from '@/components/Logo'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-900 text-white">
        <nav className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center gap-4 sticky top-0 z-30">
          <Link href="/" className="text-orange-500 flex items-center">
            <Logo className="h-9 w-auto" />
          </Link>
          <Link href="/productos" className="text-sm text-slate-300 hover:text-white ml-2">
            Productos
          </Link>
          <div className="ml-auto">
            <CartNavButton />
          </div>
        </nav>
        <main>{children}</main>
        <CartDrawer />
      </div>
    </CartProvider>
  )
}
