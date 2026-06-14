'use client'

import { useState } from 'react'

interface Props {
  priceUsd: number
  currentSalePrice?: number | null
}

export function SalePriceField({ priceUsd, currentSalePrice }: Props) {
  const [hasSale, setHasSale] = useState(currentSalePrice != null)
  const [mode, setMode] = useState<'fixed' | 'percent'>('fixed')
  const [value, setValue] = useState(currentSalePrice?.toFixed(2) ?? '')

  const computedSalePrice = (() => {
    if (!hasSale || !value) return null
    const n = Number(value)
    if (isNaN(n) || n <= 0) return null
    return mode === 'fixed' ? n : priceUsd * (1 - n / 100)
  })()

  const isValid = computedSalePrice !== null && computedSalePrice < priceUsd && computedSalePrice > 0
  const discountPct = isValid ? Math.round((1 - computedSalePrice! / priceUsd) * 100) : 0

  if (!hasSale) {
    return (
      <div>
        <input type="hidden" name="price_usd_sale" value="" />
        <button
          type="button"
          onClick={() => setHasSale(true)}
          className="text-orange-400 text-sm hover:underline"
        >
          + Agregar precio rebajado
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setMode('fixed'); setValue('') }}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            mode === 'fixed' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Precio fijo USD
        </button>
        <button
          type="button"
          onClick={() => { setMode('percent'); setValue('') }}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            mode === 'percent' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Porcentaje %
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-slate-400 text-sm">{mode === 'fixed' ? '$' : '%'}</span>
        <input
          type="number"
          step="0.01"
          min="0.01"
          max={mode === 'percent' ? '99' : undefined}
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-32 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
        />
        {isValid && (
          <span className="text-green-400 text-sm font-medium">
            → ${computedSalePrice!.toFixed(2)} USD (-{discountPct}%)
          </span>
        )}
        {hasSale && value && !isValid && (
          <span className="text-red-400 text-xs">
            Debe ser menor que ${priceUsd.toFixed(2)}
          </span>
        )}
      </div>
      <input
        type="hidden"
        name="price_usd_sale"
        value={isValid ? computedSalePrice!.toFixed(4) : ''}
      />
      <button
        type="button"
        onClick={() => { setHasSale(false); setValue('') }}
        className="text-slate-500 text-xs hover:text-slate-300 underline"
      >
        Quitar precio rebajado
      </button>
    </div>
  )
}
