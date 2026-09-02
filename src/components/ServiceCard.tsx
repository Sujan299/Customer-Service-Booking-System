import { Link } from 'react-router-dom'
import type { Service } from '../types'

function formatPrice(price: number, currency: string) {
  return `${currency} ${price.toLocaleString()}`
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link
      to={`/services/${service.id}`}
      className="block border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-blue-600 font-medium mb-1">{service.category}</p>
          <h3 className="text-base font-semibold text-gray-900 leading-tight">{service.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{service.provider.name}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-sm font-semibold text-gray-900">
            {formatPrice(service.price, service.currency)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDuration(service.durationMinutes)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-medium text-gray-700">{service.rating}</span>
          <span className="text-xs text-gray-400">({service.reviewCount})</span>
        </div>
        {!service.available && (
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Unavailable</span>
        )}
      </div>
    </Link>
  )
}
