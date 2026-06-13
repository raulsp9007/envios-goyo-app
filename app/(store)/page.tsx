import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-black text-white mb-4">🛒 Envios Goyo</h1>
      <p className="text-slate-400 text-lg mb-8">Tu mercado cubano desde el exterior</p>
      <Link
        href="/productos"
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl text-lg transition inline-block"
      >
        Ver productos
      </Link>
    </div>
  )
}
