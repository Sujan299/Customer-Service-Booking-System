import { useGetBookingsQuery } from '../../store/apiSlice'
import { Link } from 'react-router-dom'
import { BookingCard } from '../../components/BookingCard'
import { LoadingState } from '../../components/LoadingState'
import { ErrorState } from '../../components/ErrorState'
import { EmptyState } from '../../components/EmptyState'
import type { ApiError } from '../../types'

export function BookingsPage() {
  const { data: bookings, isLoading, isError, error, refetch } = useGetBookingsQuery()

  const apiError = error as ApiError | null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">My Bookings</h1>
        <p className="text-sm text-gray-500">Your service booking history</p>
      </div>

      {isLoading && <LoadingState message="Loading bookings..." />}

      {isError && (
        <ErrorState
          message={apiError?.message ?? 'Failed to load bookings.'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && bookings && bookings.length === 0 && (
        <EmptyState
          title="No bookings yet"
          description="You haven't booked any services yet."
          action={
            <Link
              to="/services"
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse services
            </Link>
          }
        />
      )}

      {!isLoading && !isError && bookings && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  )
}
