import { useParams, Link } from 'react-router-dom'
import { useGetBookingByIdQuery } from '../../store/apiSlice'
import { LoadingState } from '../../components/LoadingState'
import { ErrorState } from '../../components/ErrorState'
import type { ApiError } from '../../types'

export function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>()

  const { data: booking, isLoading, isError, error } = useGetBookingByIdQuery(bookingId!, {
    skip: !bookingId,
  })

  const apiError = error as ApiError | null

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <LoadingState message="Loading confirmation..." />
      </div>
    )
  }

  if (isError || !booking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <ErrorState message={apiError?.message ?? 'Could not load booking details.'} />
      </div>
    )
  }

  const formattedDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
        <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-xl font-semibold text-gray-900 mb-1">Booking Confirmed!</h1>
      <p className="text-gray-500 text-sm mb-6">
        Your booking has been placed successfully.
      </p>

      <div className="border border-gray-200 rounded-lg text-left divide-y divide-gray-100 mb-6">
        <div className="px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">Booking Number</span>
          <span className="text-sm font-semibold text-gray-900">{booking.bookingNumber}</span>
        </div>
        <div className="px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">Service</span>
          <span className="text-sm font-medium text-gray-900">{booking.service.name}</span>
        </div>
        <div className="px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">Provider</span>
          <span className="text-sm font-medium text-gray-900">{booking.provider.name}</span>
        </div>
        <div className="px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">Date</span>
          <span className="text-sm font-medium text-gray-900">{formattedDate}</span>
        </div>
        <div className="px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">Time</span>
          <span className="text-sm font-medium text-gray-900">{booking.timeSlot.time}</span>
        </div>
        <div className="px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">Address</span>
          <span className="text-sm font-medium text-gray-900 text-right">
            {booking.address.label}, {booking.address.city}
          </span>
        </div>
        <div className="px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">Total</span>
          <span className="text-sm font-semibold text-gray-900">
            {booking.service.currency} {booking.service.price.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link
          to="/bookings"
          className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
        >
          View My Bookings
        </Link>
        <Link
          to="/services"
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
        >
          Browse Services
        </Link>
      </div>
    </div>
  )
}
