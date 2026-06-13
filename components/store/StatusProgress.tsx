import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, type OrderStatus } from '@/types'

export default function StatusProgress({ status }: { status: OrderStatus }) {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status)

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {ORDER_STATUS_FLOW.map((s, i) => (
        <div key={s} className="flex items-center gap-1 flex-shrink-0">
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            i < currentIndex
              ? 'bg-green-900 text-green-300'
              : i === currentIndex
              ? 'bg-orange-500 text-white'
              : 'bg-slate-800 text-slate-500'
          }`}>
            {ORDER_STATUS_LABELS[s]}
          </div>
          {i < ORDER_STATUS_FLOW.length - 1 && (
            <span className="text-slate-600">→</span>
          )}
        </div>
      ))}
    </div>
  )
}
