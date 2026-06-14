import { createServiceClient } from '@/lib/supabase/server'
import CheckoutForm from '@/components/store/CheckoutForm'
import type { Province, ShippingConfig } from '@/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export default async function CheckoutPage() {
  const supabase = createServiceClient()

  const [{ data: configData }, { data: provincesData }] = await Promise.all([
    supabase.from('shipping_config').select('*').eq('id', 1).single(),
    supabase.from('provinces').select('*, municipalities(*)').order('position'),
  ])

  const shippingConfig: ShippingConfig = configData ?? {
    id: 1,
    fuel_cost_usd: 0,
    pickup_enabled: true,
    delivery_enabled: true,
    pickup_address: '',
  }

  const provinces = (provincesData ?? []) as Province[]

  return <CheckoutForm shippingConfig={shippingConfig} provinces={provinces} />
}
