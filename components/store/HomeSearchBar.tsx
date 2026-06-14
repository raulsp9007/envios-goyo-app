'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function HomeSearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/productos?q=${encodeURIComponent(q)}` : '/productos')
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <input
        type="search"
        placeholder="Buscar productos, categorías…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-orange-500 placeholder:text-slate-500"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-400 transition text-lg"
        aria-label="Buscar"
      >
        🔍
      </button>
    </form>
  )
}
