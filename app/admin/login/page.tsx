import { loginAction } from './actions'

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-xl w-full max-w-sm border border-slate-700">
        <h1 className="text-2xl font-bold text-white mb-6">Admin — Envios Goyo</h1>
        {searchParams.error && (
          <p className="text-red-400 text-sm mb-4">{searchParams.error}</p>
        )}
        <form action={loginAction} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
