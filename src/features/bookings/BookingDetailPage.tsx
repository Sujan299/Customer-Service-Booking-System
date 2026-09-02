import { useParams, Link } from 'react-router-dom'
import { useGetBookingByIdQuery } from '../../store/apiSlice'
import { LoadingState } from '../../components/LoadingState'
import { ErrorState } from '../../components/ErrorState'
import type { ApiError } from '../../types'

const statusStyles: Record<string, string> = {
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  pending: 'bg-amber-50 text-amber-700',
}

export function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>()

  const { data: booking, isLoading, isError, error, refetch } = useGetBookingByIdQuery(bookingId!, {
    skip: !bookingId,
  })

  const apiError = error as ApiError | null

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <LoadingState message="Loading booking..." />
      </div>
    )
  }

  if (isError) {
    const isNotFound = apiError?.status === 404
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {isNotFound ? (
          <div className="text-center py-16">
            <p className="text-gray-700 font-medium mb-1">Booking not found</p>
            <Link to="/bookings" className="text-sm text-blue-600 hover:underline">
              ← Back to bookings
            </Link>
          </div>
        ) : (
          <ErrorState
            message={apiError?.message ?? 'Failed to load booking.'}
            onRetry={() => refetch()}
          />
        )}
      </div>
    )
  }

  if (!booking) return null

  const formattedDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const createdAt = new Date(booking.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        to="/bookings"
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        My Bookings
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{booking.bookingNumber}</p>
          <h1 className="text-xl font-semibold text-gray-900">{booking.service.name}</h1>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
            statusStyles[booking.status] ?? 'bg-gray-100 text-gray-500'
          }`}
        >
          {booking.status}
        </span>
      </div>

      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
        <div className="px-4 py-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Service</p>
            <p className="text-sm font-medium text-gray-900">{booking.service.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Category</p>
            <p className="text-sm font-medium text-gray-900">{booking.service.category}</p>
          </div>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Provider</p>
            <p className="text-sm font-medium text-gray-900">{booking.provider.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Phone</p>
            <p className="text-sm font-medium text-gray-900">{booking.provider.phone}</p>
          </div>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Date</p>
            <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Time</p>
            <p className="text-sm font-medium text-gray-900">{booking.timeSlot.time}</p>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-gray-500 mb-0.5">Address</p>
          <p className="text-sm font-medium text-gray-900">{booking.address.label}</p>
          <p className="text-xs text-gray-500">{booking.address.line1}, {booking.address.city}, {booking.address.district}</p>
        </div>
        {booking.notes && (
          <div className="px-4 py-3">
            <p className="text-xs text-gray-500 mb-0.5">Notes</p>
            <p className="text-sm text-gray-700">{booking.notes}</p>
          </div>
        )}
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Booked on</p>
            <p className="text-sm text-gray-700">{createdAt}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Total</p>
            <p className="text-base font-semibold text-gray-900">
              {booking.service.currency} {booking.service.price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
