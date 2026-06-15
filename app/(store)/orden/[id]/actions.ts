'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadProofAction(
  orderId: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const file = formData.get('file') as File | null
  if (!file || !file.size) {
    return { success: false, message: 'No se recibió ningún archivo.' }
  }
  if (!file.type.startsWith('image/')) {
    return { success: false, message: 'Solo se aceptan imágenes (JPG, PNG, WebP).' }
  }
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, message: 'La imagen no puede superar 5 MB.' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${orderId}.${ext}`

  const supabase = createServiceClient()

  const bytes = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(path, Buffer.from(bytes), { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error('[proof] Storage upload error:', uploadError)
    return { success: false, message: 'Error al subir la imagen. Intenta de nuevo.' }
  }

  const { data: urlData } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(path)

  const payment_proof_url = urlData.publicUrl

  // Check auto-approve setting
  const { data: settingRow } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'auto_approve_proof')
    .single()

  const autoApprove = settingRow?.value === 'true'
  const updates: Record<string, string> = { payment_proof_url }
  if (autoApprove) updates.status = 'waiting'

  await supabase.from('orders').update(updates).eq('id', orderId)

  // Notify admin via WhatsApp (fire-and-forget)
  const phone = process.env.CALLMEBOT_PHONE
  const apiKey = process.env.CALLMEBOT_APIKEY
  if (phone && apiKey) {
    const { data: order } = await supabase
      .from('orders')
      .select('order_number, customer_name')
      .eq('id', orderId)
      .single()
    if (order) {
      const msg = encodeURIComponent(
        `Comprobante recibido — Orden #${order.order_number} de ${order.customer_name}${autoApprove ? ' (auto-aprobada)' : ' — requiere revisión'}`
      )
      fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${msg}&apikey=${apiKey}`)
        .catch(e => console.error('[proof] WhatsApp error:', e))
    }
  }

  revalidatePath(`/orden/${orderId}`)

  return {
    success: true,
    message: autoApprove
      ? 'Tu orden está ahora en revisión por el equipo.'
      : 'Comprobante recibido. El equipo lo revisará pronto.',
  }
}
