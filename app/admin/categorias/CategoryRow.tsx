'use client'

import { useState } from 'react'

interface Category {
  id: string
  name: string
  emoji: string
  position: number
}

interface Props {
  category: Category
  productCount: number
  updateAction: (formData: FormData) => Promise<void>
  deleteAction: (formData: FormData) => Promise<void>
}

export default function CategoryRow({ category, productCount, updateAction, deleteAction }: Props) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [emoji, setEmoji] = useState(category.emoji)

  if (editing) {
    return (
      <tr className="border-b border-slate-700 bg-slate-750">
        <td className="p-3">
          <input
            value={emoji}
            onChange={e => setEmoji(e.target.value)}
            maxLength={8}
            className="w-14 bg-slate-900 border border-slate-600 text-white text-center text-xl rounded-lg px-1 py-1 focus:outline-none focus:border-orange-500"
          />
        </td>
        <td className="p-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500"
          />
        </td>
        <td className="p-3 text-right text-slate-400">{productCount}</td>
        <td className="p-3">
          <div className="flex gap-2 justify-end">
            <form
              action={updateAction}
              onSubmit={() => setEditing(false)}
            >
              <input type="hidden" name="id" value={category.id} />
              <input type="hidden" name="name" value={name} />
              <input type="hidden" name="emoji" value={emoji} />
              <button
                type="submit"
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition"
              >
                Guardar
              </button>
            </form>
            <button
              onClick={() => { setName(category.name); setEmoji(category.emoji); setEditing(false) }}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-700 last:border-0 hover:bg-slate-750 group">
      <td className="p-3 text-2xl">{category.emoji}</td>
      <td className="p-3 text-white font-medium">{category.name}</td>
      <td className="p-3 text-right">
        {productCount > 0 ? (
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
            {productCount} productos
          </span>
        ) : (
          <span className="text-xs text-slate-600">0</span>
        )}
      </td>
      <td className="p-3">
        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-orange-400 hover:text-orange-300 px-2 py-1 rounded transition"
          >
            Editar
          </button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={category.id} />
            <button
              type="submit"
              onClick={e => {
                if (productCount > 0 && !confirm(
                  `"${category.name}" tiene ${productCount} productos activos. ¿Eliminar de todas formas?`
                )) e.preventDefault()
              }}
              className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded transition"
            >
              Eliminar
            </button>
          </form>
        </div>
      </td>
    </tr>
  )
}
