'use client'

import { useState } from 'react'

export function ProfitPreview({
  initialPriceUsd,
  initialCostCup,
  rate,
}: {
  initialPriceUsd: number
  initialCostCup: number
  rate: number
}) {
  const [priceStr, setPriceStr] = useState(initialPriceUsd > 0 ? String(initialPriceUsd) : '')
  const [costStr, setCostStr] = useState(initialCostCup > 0 ? String(initialCostCup) : '')

  const priceUsd = Number(priceStr) || 0
  const costCup = Number(costStr) || 0
  const revenueCup = priceUsd * rate
  const profitCup = Math.round(revenueCup - costCup)
  const profitPct = revenueCup > 0 ? Math.round((profitCup / revenueCup) * 100) : 0
  const showPreview = priceUsd > 0 || costCup > 0
  const isProfit = profitCup >= 0

  return (
    <div className="space-y-3">
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
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
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
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

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
            ({profitPct}% · tasa {rate} CUP/USD)
          </span>
        </div>
      )}
    </div>
  )
}
