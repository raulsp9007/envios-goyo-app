import { logoutAction } from './login/actions'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-orange-500">Admin · Envios Goyo</span>
        <Link href="/admin" className="text-sm text-slate-300 hover:text-white">Dashboard</Link>
        <Link href="/admin/ordenes" className="text-sm text-slate-300 hover:text-white">Órdenes</Link>
        <Link href="/admin/productos" className="text-sm text-slate-300 hover:text-white">Productos</Link>
        <Link href="/admin/tasa" className="text-sm text-slate-300 hover:text-white">Tasa</Link>
        <Link href="/admin/configuracion" className="text-sm text-slate-300 hover:text-white">Config</Link>
        <div className="ml-auto">
          <form action={logoutAction}>
            <button className="text-sm text-slate-400 hover:text-white">Salir</button>
          </form>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
