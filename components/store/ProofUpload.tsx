'use client'

import { useRef, useState, useTransition } from 'react'
import { uploadProofAction } from '@/app/(store)/orden/[id]/actions'

export default function ProofUpload({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const file = inputRef.current?.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setResult({ success: false, message: 'Solo imágenes (JPG, PNG, WebP).' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setResult({ success: false, message: 'La imagen no puede superar 5 MB.' })
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    startTransition(async () => {
      const res = await uploadProofAction(orderId, formData)
      setResult(res)
    })
  }

  if (result?.success) {
    return (
      <div className="bg-green-900/50 border border-green-700 text-green-300 rounded-xl p-4">
        <p className="font-medium">✅ Comprobante enviado</p>
        <p className="text-sm mt-1 text-green-400">{result.message}</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 border border-orange-900/60 rounded-xl p-4">
      <h2 className="font-bold text-orange-400 mb-1">Subir comprobante Zelle</h2>
      <p className="text-slate-400 text-sm mb-3">
        Sube una captura de pantalla o foto de tu transferencia para confirmar el pago.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="block w-full text-sm text-slate-400
            file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
            file:text-sm file:font-medium file:bg-orange-500 file:text-white
            hover:file:bg-orange-600 cursor-pointer"
        />
        {result && !result.success && (
          <p className="text-red-400 text-sm">{result.message}</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-lg text-sm transition"
        >
          {isPending ? 'Enviando…' : 'Enviar comprobante'}
        </button>
      </form>
    </div>
  )
}
