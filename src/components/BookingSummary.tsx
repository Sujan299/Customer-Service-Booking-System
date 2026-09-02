import type { Service, TimeSlot, Address } from '../types'

interface BookingSummaryProps {
  service: Service
  date: string
  timeSlot: TimeSlot | undefined
  address: Address | undefined
  notes?: string
}

export function BookingSummary({ service, date, timeSlot, address, notes }: BookingSummaryProps) {
  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—'

  return (
    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
      <div className="px-4 py-3">
        <p className="text-xs text-gray-500 mb-0.5">Service</p>
        <p className="text-sm font-medium text-gray-900">{service.name}</p>
        <p className="text-xs text-gray-500">{service.provider.name}</p>
      </div>
      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Date</p>
          <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Time</p>
          <p className="text-sm font-medium text-gray-900">{timeSlot?.time ?? '—'}</p>
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-xs text-gray-500 mb-0.5">Address</p>
        {address ? (
          <>
            <p className="text-sm font-medium text-gray-900">{address.label}</p>
            <p className="text-xs text-gray-500">{address.line1}, {address.city}</p>
          </>
        ) : (
          <p className="text-sm text-gray-400">—</p>
        )}
      </div>
      {notes && (
        <div className="px-4 py-3">
          <p className="text-xs text-gray-500 mb-0.5">Notes</p>
          <p className="text-sm text-gray-700">{notes}</p>
        </div>
      )}
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-xs text-gray-500">Total</p>
        <p className="text-base font-semibold text-gray-900">
          {service.currency} {service.price.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
