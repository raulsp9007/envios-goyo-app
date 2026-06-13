import { calculateItemProfit, calculateOrderProfit } from '@/lib/profit'
import type { OrderItem } from '@/types'

export default function ProfitTable({
  items,
  exchangeRate,
}: {
  items: OrderItem[]
  exchangeRate: number
}) {
  const lineItems = items.map(item => ({
    product_name: item.product_name,
    quantity: item.quantity,
    price_usd: item.price_usd,
    cost_cup: item.cost_cup,
    exchange_rate: exchangeRate,
  }))

  const summary = calculateOrderProfit(lineItems)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-xs">
              <th className="text-left p-2">Producto</th>
              <th className="text-right p-2">Cant</th>
              <th className="text-right p-2">Precio USD</th>
              <th className="text-right p-2">Costo CUP</th>
              <th className="text-right p-2">Importe CUP</th>
              <th className="text-right p-2">Ganancia CUP</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, i) => {
              const result = calculateItemProfit(item)
              return (
                <tr key={i} className="border-b border-slate-700 last:border-0">
                  <td className="p-2 text-white">{item.product_name}</td>
                  <td className="p-2 text-right text-slate-300">{item.quantity}</td>
                  <td className="p-2 text-right text-orange-400">${item.price_usd.toFixed(2)}</td>
                  <td className="p-2 text-right text-slate-300">{item.cost_cup.toFixed(0)}</td>
                  <td className="p-2 text-right text-slate-300">{result.investment_cup.toFixed(0)}</td>
                  <td className={`p-2 text-right font-medium ${result.profit_cup >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {result.profit_cup.toFixed(0)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-600 text-sm font-bold">
              <td colSpan={4} className="p-2 text-slate-400">Tasa: {exchangeRate} CUP/USD</td>
              <td className="p-2 text-right text-slate-300">{summary.total_investment_cup.toFixed(0)}</td>
              <td className="p-2 text-right text-green-400">{summary.total_profit_cup.toFixed(0)}</td>
            </tr>
            <tr>
              <td colSpan={6} className="p-2 pt-1 text-xs text-slate-400">
                Inversión: {summary.total_investment_cup.toFixed(0)} CUP ·
                Ganancia: {summary.total_profit_cup.toFixed(0)} CUP
                (~${summary.profit_usd.toFixed(2)} USD)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
