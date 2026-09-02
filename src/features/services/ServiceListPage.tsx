import { useState } from 'react'
import { useGetServicesQuery } from '../../store/apiSlice'
import { ServiceCard } from '../../components/ServiceCard'
import { ServiceFilters } from '../../components/ServiceFilters'
import { LoadingState } from '../../components/LoadingState'
import { ErrorState } from '../../components/ErrorState'
import { EmptyState } from '../../components/EmptyState'
import type { ApiError } from '../../types'

export function ServiceListPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const { data: services, isLoading, isError, error, refetch } = useGetServicesQuery({ search, category })

  const apiError = error as ApiError | null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Available Services</h1>
        <p className="text-gray-500 text-sm">Browse and book home services in your area</p>
      </div>

      <div className="mb-5">
        <ServiceFilters
          search={search}
          category={category}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />
      </div>

      {isLoading && <LoadingState message="Loading services..." />}

      {isError && (
        <ErrorState
          message={apiError?.message ?? 'Failed to load services.'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && services && services.length === 0 && (
        <EmptyState
          title="No services found"
          description="Try changing your search or selecting a different category."
        />
      )}

      {!isLoading && !isError && services && services.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}
