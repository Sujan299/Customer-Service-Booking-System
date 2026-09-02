import { Link } from 'react-router-dom'
import type { Booking } from '../types'

const statusStyles: Record<string, string> = {
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  pending: 'bg-amber-50 text-amber-700',
}

interface BookingCardProps {
  booking: Booking
}

export function BookingCard({ booking }: BookingCardProps) {
  const formattedDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{booking.bookingNumber}</p>
          <h3 className="text-base font-semibold text-gray-900">{booking.service.name}</h3>
          <p className="text-sm text-gray-500">{booking.provider.name}</p>
        </div>
        <span
          className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full capitalize ${
            statusStyles[booking.status] ?? 'bg-gray-100 text-gray-500'
          }`}
        >
          {booking.status}
        </span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          {formattedDate} · {booking.timeSlot.time}
        </div>
        <Link
          to={`/bookings/${booking.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View details →
        </Link>
      </div>
    </div>
  )
}
