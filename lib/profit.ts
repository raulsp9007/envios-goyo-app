export interface ProfitLineItem {
  product_name: string
  quantity: number
  price_usd: number
  cost_cup: number
  exchange_rate: number
}

export interface ProfitResult {
  revenue_cup: number
  investment_cup: number
  profit_cup: number
}

export function calculateItemProfit(item: ProfitLineItem): ProfitResult {
  const revenue_cup = item.price_usd * item.exchange_rate * item.quantity
  const investment_cup = item.cost_cup * item.quantity
  const profit_cup = revenue_cup - investment_cup
  return { revenue_cup, investment_cup, profit_cup }
}

export function calculateOrderProfit(
  items: ProfitLineItem[],
): {
  total_investment_cup: number
  total_revenue_cup: number
  total_profit_cup: number
  profit_usd: number
} {
  const results = items.map(calculateItemProfit)
  const total_investment_cup = results.reduce((s, r) => s + r.investment_cup, 0)
  const total_revenue_cup = results.reduce((s, r) => s + r.revenue_cup, 0)
  const total_profit_cup = results.reduce((s, r) => s + r.profit_cup, 0)
  const rate = items[0]?.exchange_rate ?? 1
  const profit_usd = total_profit_cup / rate
  return { total_investment_cup, total_revenue_cup, total_profit_cup, profit_usd }
}
