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
  price_usd_sale: number | null
  description: string
  image_url: string
  active: boolean
  created_at: string
}

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
  customer_municipio: string
  customer_provincia: string
  customer_note: string
  status: OrderStatus
  total_usd: number
  shipping_method: 'pickup' | 'delivery'
  shipping_cost_usd: number
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

export interface Province {
  id: number
  name: string
  base_price_usd: number
  position: number
  municipalities?: Municipality[]
}

export interface Municipality {
  id: number
  province_id: number
  name: string
  surcharge_usd: number
}

export interface ShippingConfig {
  id: 1
  fuel_cost_usd: number
  pickup_enabled: boolean
  delivery_enabled: boolean
  pickup_address: string
}
