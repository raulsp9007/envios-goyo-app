'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import StatusProgress from '@/components/store/StatusProgress'
import type { OrderStatus } from '@/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function OrderTracker({
  orderId,
  initialStatus,
}: {
  orderId: string
  initialStatus: OrderStatus
}) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus)

  useEffect(() => {
    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        payload => {
          const next = payload.new.status as OrderStatus
          if (next) setStatus(next)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId])

  return <StatusProgress status={status} />
}
