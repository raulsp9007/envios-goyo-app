'use client'

import { useState, useEffect } from 'react'
import type { OrderItem } from '@/types'

interface Props {
  items: OrderItem[]
  orderId: string
}

function storageKey(orderId: string) {
  return `shopping_checklist_${orderId}`
}

export default function ShoppingChecklist({ items, orderId }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(orderId))
      if (saved) setChecked(JSON.parse(saved))
    } catch {}
    setMounted(true)
  }, [orderId])

  function toggle(id: string) {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] }
      try { localStorage.setItem(storageKey(orderId), JSON.stringify(next)) } catch {}
      return next
    })
  }

  function reset() {
    setChecked({})
    try { localStorage.removeItem(storageKey(orderId)) } catch {}
  }

  const total = items.length
  const done = items.filter(i => checked[i.id]).length
  const allDone = done === total

  if (!mounted) return null

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-white">Lista de compra</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{done}/{total}</span>
          {done > 0 && (
            <button
              onClick={reset}
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              Reiniciar
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-700 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${allDone ? 'bg-green-500' : 'bg-orange-500'}`}
          style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
        />
      </div>

      {allDone && (
        <div className="mb-4 bg-green-900/40 border border-green-700 text-green-400 text-sm rounded-lg px-3 py-2 text-center font-medium">
          Todo comprado
        </div>
      )}

      <div className="space-y-1">
        {items.map(item => {
          const isChecked = !!checked[item.id]
          return (
            <label
              key={item.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition select-none ${
                isChecked
                  ? 'bg-green-900/20 opacity-60'
                  : 'hover:bg-slate-700/50'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(item.id)}
                className="w-4 h-4 accent-orange-500 cursor-pointer shrink-0"
              />
              <span className={`text-sm flex-1 ${isChecked ? 'line-through text-slate-500' : 'text-white'}`}>
                {item.product_name}
              </span>
              <span className={`text-xs shrink-0 font-medium ${isChecked ? 'text-slate-600' : 'text-orange-400'}`}>
                ×{item.quantity}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
