import { importCSVAction } from './actions'
import Link from 'next/link'

export default async function ImportarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Importar productos</h1>
      <p className="text-slate-400 text-sm mb-6">
        Importa productos desde un archivo CSV exportado de WooCommerce.
        Solo se importan productos de tipo <strong className="text-white">simple</strong> y publicados.
        El costo CUP se establece en 0 — actualízalo manualmente.
      </p>

      {params.success && (
        <div className="bg-green-900/40 border border-green-700 text-green-300 rounded-xl p-4 mb-6">
          ✅ Se importaron <strong>{params.success}</strong> productos correctamente.{' '}
          <Link href="/admin/productos" className="underline">Ver productos →</Link>
        </div>
      )}

      {params.error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl p-4 mb-6">
          ❌ {decodeURIComponent(params.error)}
        </div>
      )}

      <form action={importCSVAction} encType="multipart/form-data" className="space-y-5">
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center">
          <p className="text-slate-400 text-sm mb-3">Archivo CSV de WooCommerce</p>
          <input
            name="csv_file"
            type="file"
            accept=".csv,text/csv"
            required
            className="text-sm text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-medium file:bg-orange-500 file:text-white hover:file:bg-orange-600 file:cursor-pointer"
          />
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-400 space-y-1">
          <p className="text-slate-300 font-medium mb-2">Mapeo de categorías</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {[
              ['Carnicos', 'Cárnicos'], ['Embutidos', 'Embutidos'],
              ['Granos', 'Granos'], ['Productos del agro', 'Agro'],
              ['Bebidas', 'Bebidas'], ['Lácteos', 'Lácteos'],
              ['Hogar', 'Hogar'], ['Pastas', 'Pastas'],
              ['Confituras', 'Confituras'], ['Café', 'Café'],
              ['Venta rapida', 'Otros'], ['Otros', 'Otros'],
            ].map(([from, to]) => (
              <div key={from} className="flex gap-1">
                <span className="text-slate-500">{from}</span>
                <span>→</span>
                <span className="text-white">{to}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition"
        >
          Importar productos
        </button>
      </form>
    </div>
  )
}
