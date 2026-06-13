import { calculateItemProfit, calculateOrderProfit } from '../profit'

describe('calculateItemProfit', () => {
  it('calculates profit correctly matching spreadsheet example', () => {
    // Picadillo: 8 × ($1.80 × 600 − 450) = 5040
    const result = calculateItemProfit({
      product_name: 'Picadillo',
      quantity: 8,
      price_usd: 1.80,
      cost_cup: 450,
      exchange_rate: 600,
    })
    expect(result.revenue_cup).toBe(8640)
    expect(result.investment_cup).toBe(3600)
    expect(result.profit_cup).toBe(5040)
  })

  it('returns zero profit when revenue equals cost', () => {
    const result = calculateItemProfit({
      product_name: 'Test',
      quantity: 1,
      price_usd: 1,
      cost_cup: 600,
      exchange_rate: 600,
    })
    expect(result.profit_cup).toBe(0)
  })
})

describe('calculateOrderProfit', () => {
  it('sums multiple items correctly', () => {
    const result = calculateOrderProfit([
      { product_name: 'A', quantity: 10, price_usd: 1.00, cost_cup: 350, exchange_rate: 600 },
      { product_name: 'B', quantity: 1,  price_usd: 12.92, cost_cup: 5500, exchange_rate: 600 },
    ])
    // A: (600 - 350) × 10 = 2500
    // B: (7752 - 5500) × 1 = 2252
    expect(result.total_profit_cup).toBe(4752)
  })
})
