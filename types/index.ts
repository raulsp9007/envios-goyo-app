export type OrderStatus =
  | 'pending_payment'
  | 'waiting'
  | 'processing'
  | 'delivered'
  | 'completed'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: '⏳ Pendiente a pago',
  waiting: '🔄 En espera',
  processing: '⚙️ Procesando',
  delivered: '🚚 Entregado',
  completed: '✅ Completado',
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pending_payment',
  'waiting',
  'processing',
  'delivered',
  'completed',
]

export interface Product {
  id: string
  name: string
  category: string
  price_usd: number
  description: string
  image_url: string
  active: boolean
  created_at: string
}

// Admin-only — includes cost
export interface ProductWithCost extends Product {
  cost_cup: number
}

export interface CartItem {
  product_id: string
  name: string
  price_usd: number
  quantity: number
}

export interface Order {
  id: string
  order_number: number
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_note: string
  status: OrderStatus
  total_usd: number
  exchange_rate_snapshot: number
  payment_instructions: string
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  price_usd: number
  cost_cup: number
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}
