'use client'

import { deleteProductAction } from './actions'

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={deleteProductAction.bind(null, id)}>
      <button
        type="submit"
        onClick={e => {
          if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) e.preventDefault()
        }}
        className="text-xs text-red-400 hover:text-red-300 hover:underline transition"
      >
        Eliminar
      </button>
    </form>
  )
}
