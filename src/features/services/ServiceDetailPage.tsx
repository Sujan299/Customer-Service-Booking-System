import { useParams, Link } from 'react-router-dom'
import { useGetServiceByIdQuery } from '../../store/apiSlice'
import { LoadingState } from '../../components/LoadingState'
import { ErrorState } from '../../components/ErrorState'
import type { ApiError } from '../../types'

function formatPrice(price: number, currency: string) {
  return `${currency} ${price.toLocaleString()}`
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>()

  const { data: service, isLoading, isError, error, refetch } = useGetServiceByIdQuery(serviceId!, {
    skip: !serviceId,
  })

  const apiError = error as ApiError | null

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <LoadingState message="Loading service..." />
      </div>
    )
  }

  if (isError) {
    const isNotFound = apiError?.status === 404
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        {isNotFound ? (
          <div className="text-center py-16">
            <p className="text-gray-700 font-medium mb-1">Service not found</p>
            <p className="text-gray-500 text-sm mb-4">
              This service may have been removed or the link is incorrect.
            </p>
            <Link to="/services" className="text-sm text-blue-600 hover:underline">
              ← Back to services
            </Link>
          </div>
        ) : (
          <ErrorState
            message={apiError?.message ?? 'Failed to load service.'}
            onRetry={() => refetch()}
          />
        )}
      </div>
    )
  }

  if (!service) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/services" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All services
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2">
          <p className="text-sm text-blue-600 font-medium mb-1">{service.category}</p>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">{service.name}</h1>
          <p className="text-gray-500 text-sm mb-4">{service.provider.name}</p>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {service.rating} ({service.reviewCount} reviews)
            </span>
            <span>{formatDuration(service.durationMinutes)}</span>
          </div>

          <h2 className="text-sm font-semibold text-gray-900 mb-2">About this service</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
        </div>

        <div>
          <div className="border border-gray-200 rounded-lg p-4 sticky top-4">
            <p className="text-xl font-semibold text-gray-900 mb-0.5">
              {formatPrice(service.price, service.currency)}
            </p>
            <p className="text-xs text-gray-400 mb-4">{formatDuration(service.durationMinutes)} service</p>

            <div className="text-sm text-gray-600 mb-4 space-y-1.5">
              <div className="flex justify-between">
                <span>Provider</span>
                <span className="font-medium text-gray-800">{service.provider.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Category</span>
                <span className="font-medium text-gray-800">{service.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Availability</span>
                <span className={`font-medium ${service.available ? 'text-green-600' : 'text-gray-400'}`}>
                  {service.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            {service.available ? (
              <Link
                to={`/services/${service.id}/book`}
                className="block w-full text-center py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Book Now
              </Link>
            ) : (
              <button
                disabled
                className="block w-full text-center py-2.5 px-4 bg-gray-100 text-gray-400 text-sm font-medium rounded-md cursor-not-allowed"
              >
                Currently Unavailable
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
