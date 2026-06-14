'use client'

import { useState } from 'react'

export function ProductPricingSection({
  initialPriceUsd,
  initialCostCup,
  currentSalePrice,
  rate,
}: {
  initialPriceUsd: number
  initialCostCup: number
  currentSalePrice?: number | null
  rate: number
}) {
  const [priceStr, setPriceStr] = useState(initialPriceUsd > 0 ? String(initialPriceUsd) : '')
  const [costStr, setCostStr] = useState(initialCostCup > 0 ? String(initialCostCup) : '')

  const [hasSale, setHasSale] = useState(currentSalePrice != null)
  const [saleMode, setSaleMode] = useState<'fixed' | 'percent'>('fixed')
  const [saleValue, setSaleValue] = useState(currentSalePrice?.toFixed(2) ?? '')

  const priceUsd = Number(priceStr) || 0
  const costCup = Number(costStr) || 0

  const computedSalePrice = (() => {
    if (!hasSale || !saleValue) return null
    const n = Number(saleValue)
    if (isNaN(n) || n <= 0) return null
    return saleMode === 'fixed' ? n : priceUsd * (1 - n / 100)
  })()
  const saleIsValid = computedSalePrice !== null && computedSalePrice < priceUsd && computedSalePrice > 0
  const discountPct = saleIsValid ? Math.round((1 - computedSalePrice! / priceUsd) * 100) : 0

  const effectivePrice = saleIsValid ? computedSalePrice! : priceUsd
  const revenueCup = effectivePrice * rate
  const profitCup = Math.round(revenueCup - costCup)
  const profitPct = revenueCup > 0 ? Math.round((profitCup / revenueCup) * 100) : 0
  const showPreview = priceUsd > 0 || costCup > 0
  const isProfit = profitCup >= 0

  const inputCls = 'w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500'

  return (
    <div className="space-y-3">
      {/* Price + Cost */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Precio venta (USD) *</label>
          <input
            name="price_usd"
            type="number"
            step="0.01"
            min="0"
            required
            value={priceStr}
            onChange={e => setPriceStr(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Costo (CUP) *</label>
          <input
            name="cost_cup"
            type="number"
            step="0.01"
            min="0"
            required
            value={costStr}
            onChange={e => setCostStr(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Sale price */}
      <div>
        <label className="block text-sm text-slate-300 mb-1">Precio rebajado</label>
        {!hasSale ? (
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
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              {(['fixed', 'percent'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setSaleMode(m); setSaleValue('') }}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    saleMode === m ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {m === 'fixed' ? 'Precio fijo USD' : 'Porcentaje %'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 text-sm">{saleMode === 'fixed' ? '$' : '%'}</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={saleMode === 'percent' ? '99' : undefined}
                value={saleValue}
                onChange={e => setSaleValue(e.target.value)}
                className="w-32 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
              />
              {saleIsValid && (
                <span className="text-green-400 text-sm font-medium">
                  → ${computedSalePrice!.toFixed(2)} USD (-{discountPct}%)
                </span>
              )}
              {hasSale && saleValue && !saleIsValid && (
                <span className="text-red-400 text-xs">
                  Debe ser menor que ${priceUsd.toFixed(2)}
                </span>
              )}
            </div>
            <input
              type="hidden"
              name="price_usd_sale"
              value={saleIsValid ? computedSalePrice!.toFixed(4) : ''}
            />
            <button
              type="button"
              onClick={() => { setHasSale(false); setSaleValue('') }}
              className="text-slate-500 text-xs hover:text-slate-300 underline"
            >
              Quitar precio rebajado
            </button>
          </div>
        )}
      </div>

      {/* Profit preview */}
      {showPreview && (
        <div className={`flex flex-wrap items-center gap-3 rounded-lg px-3 py-2 text-sm ${
          isProfit
            ? 'bg-green-500/10 border border-green-500/20'
            : 'bg-red-500/10 border border-red-500/20'
        }`}>
          <span className="text-slate-400">Ganancia:</span>
          <span className={`font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {profitCup.toLocaleString()} CUP
          </span>
          <span className={`text-xs ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
            ({profitPct}%{saleIsValid ? ` · precio rebajado $${computedSalePrice!.toFixed(2)}` : ''} · tasa {rate})
          </span>
        </div>
      )}
    </div>
  )
}
