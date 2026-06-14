'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Province } from '@/types'

interface Props {
  province: Province
  isSelected: boolean
  updateAction: (formData: FormData) => Promise<void>
  deleteAction: (formData: FormData) => Promise<void>
}

export default function ProvinceRow({ province, isSelected, updateAction, deleteAction }: Props) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(province.name)
  const [basePrice, setBasePrice] = useState(province.base_price_usd.toString())

  if (editing) {
    return (
      <tr className="border-b border-slate-700 bg-slate-900">
        <td colSpan={3} className="p-3">
          <div className="flex gap-2 items-center flex-wrap">
            <form action={updateAction} onSubmit={() => setEditing(false)} className="flex gap-2 items-center flex-wrap">
              <input type="hidden" name="id" value={province.id} />
              <input
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nombre provincia"
                className="bg-slate-800 border border-slate-600 text-white rounded-lg px-2 py-1.5 text-sm w-40 focus:outline-none focus:border-orange-500"
              />
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-sm">$</span>
                <input
                  name="base_price_usd"
                  type="number"
                  step="0.01"
                  min="0"
                  value={basePrice}
                  onChange={e => setBasePrice(e.target.value)}
                  placeholder="Precio base"
                  className="bg-slate-800 border border-slate-600 text-white rounded-lg px-2 py-1.5 text-sm w-28 focus:outline-none focus:border-orange-500"
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
                onClick={() => { setName(province.name); setBasePrice(province.base_price_usd.toString()); setEditing(false) }}
                className="text-xs text-slate-400 hover:text-white px-2 py-1.5 rounded-lg transition"
              >
                Cancelar
              </button>
            </form>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className={`border-b border-slate-700 last:border-0 group ${isSelected ? 'bg-orange-500/10' : 'hover:bg-slate-750'}`}>
      <td className="p-3">
        <Link
          href={`?provincia=${province.id}`}
          className={`font-medium hover:text-orange-400 transition ${isSelected ? 'text-orange-400' : 'text-white'}`}
        >
          {province.name}
        </Link>
      </td>
      <td className="p-3 text-slate-300 text-right">${province.base_price_usd.toFixed(2)}</td>
      <td className="p-3">
        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-orange-400 hover:text-orange-300 px-2 py-1 rounded transition"
          >
            Editar
          </button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={province.id} />
            <button
              type="submit"
              onClick={e => {
                if (!confirm(`¿Eliminar "${province.name}" y todos sus municipios?`)) e.preventDefault()
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
