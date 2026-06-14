'use client'

import { useState } from 'react'
import type { Municipality } from '@/types'

interface Props {
  municipality: Municipality
  updateAction: (formData: FormData) => Promise<void>
  deleteAction: (formData: FormData) => Promise<void>
}

export default function MunicipalityRow({ municipality, updateAction, deleteAction }: Props) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(municipality.name)
  const [surcharge, setSurcharge] = useState(municipality.surcharge_usd.toString())

  if (editing) {
    return (
      <tr className="border-b border-slate-700 bg-slate-900">
        <td colSpan={2} className="p-3">
          <form action={updateAction} onSubmit={() => setEditing(false)} className="flex gap-2 items-center flex-wrap">
            <input type="hidden" name="id" value={municipality.id} />
            <input
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre municipio"
              className="bg-slate-800 border border-slate-600 text-white rounded-lg px-2 py-1.5 text-sm flex-1 min-w-32 focus:outline-none focus:border-orange-500"
            />
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-sm">+$</span>
              <input
                name="surcharge_usd"
                type="number"
                step="0.01"
                min="0"
                value={surcharge}
                onChange={e => setSurcharge(e.target.value)}
                placeholder="Recargo"
                className="bg-slate-800 border border-slate-600 text-white rounded-lg px-2 py-1.5 text-sm w-24 focus:outline-none focus:border-orange-500"
              />
            </div>
            <button
              type="submit"
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => { setName(municipality.name); setSurcharge(municipality.surcharge_usd.toString()); setEditing(false) }}
              className="text-xs text-slate-400 hover:text-white px-2 py-1.5 rounded-lg transition"
            >
              Cancelar
            </button>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-700 last:border-0 group hover:bg-slate-750">
      <td className="p-3 text-white">{municipality.name}</td>
      <td className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">+${municipality.surcharge_usd.toFixed(2)}</span>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-orange-400 hover:text-orange-300 px-2 py-1 rounded transition"
            >
              Editar
            </button>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={municipality.id} />
              <button
                type="submit"
                onClick={e => {
                  if (!confirm(`¿Eliminar municipio "${municipality.name}"?`)) e.preventDefault()
                }}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded transition"
              >
                Eliminar
              </button>
            </form>
          </div>
        </div>
      </td>
    </tr>
  )
}
