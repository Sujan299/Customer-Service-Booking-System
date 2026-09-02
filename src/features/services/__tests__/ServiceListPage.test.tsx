import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider as ReduxProvider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { ServiceListPage } from '../ServiceListPage'
import { apiSlice } from '../../../store/apiSlice'
import notificationsReducer from '../../../store/notificationsSlice'
import * as servicesApiModule from '../../../api/services/servicesApi'
import type { Service } from '../../../types'

vi.mock('../../../api/services/servicesApi')

const mockServices: Service[] = [
  {
    id: 's1',
    name: 'Home Cleaning',
    category: 'Cleaning',
    description: 'Professional cleaning',
    providerId: 'p1',
    provider: { id: 'p1', name: 'CleanPro', phone: '9841000001' },
    price: 1500,
    currency: 'NPR',
    durationMinutes: 180,
    rating: 4.7,
    reviewCount: 214,
    available: true,
  },
  {
    id: 's2',
    name: 'Plumbing Repair',
    category: 'Plumbing',
    description: 'Leak fixes',
    providerId: 'p2',
    provider: { id: 'p2', name: 'FixIt Nepal', phone: '9841000002' },
    price: 800,
    currency: 'NPR',
    durationMinutes: 60,
    rating: 4.5,
    reviewCount: 98,
    available: true,
  },
]

function makeStore() {
  return configureStore({
    reducer: {
      notifications: notificationsReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  })
}

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ReduxProvider store={makeStore()}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ReduxProvider>,
  )
}

describe('ServiceListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a list of services on successful load', async () => {
    vi.mocked(servicesApiModule.servicesApi.getServices).mockResolvedValue(mockServices)

    renderWithProviders(<ServiceListPage />)

    expect(screen.getByText('Loading services...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Home Cleaning')).toBeInTheDocument()
      expect(screen.getByText('Plumbing Repair')).toBeInTheDocument()
    })
  })

  it('shows an error state when the API fails', async () => {
    vi.mocked(servicesApiModule.servicesApi.getServices).mockRejectedValue({
      status: 500,
      code: 'SERVER_ERROR',
      message: 'Something went wrong while loading services.',
    })

    renderWithProviders(<ServiceListPage />)

    await waitFor(() => {
      expect(screen.getByText('Something went wrong while loading services.')).toBeInTheDocument()
    })
  })

  it('shows an empty state when no services are returned', async () => {
    vi.mocked(servicesApiModule.servicesApi.getServices).mockResolvedValue([])

    renderWithProviders(<ServiceListPage />)

    await waitFor(() => {
      expect(screen.getByText('No services found')).toBeInTheDocument()
    })
  })

  it('filters services by search term', async () => {
    vi.mocked(servicesApiModule.servicesApi.getServices)
      .mockResolvedValueOnce(mockServices)
      .mockResolvedValue([mockServices[0]])

    renderWithProviders(<ServiceListPage />)

    await waitFor(() => screen.getByText('Home Cleaning'))

    const searchInput = screen.getByPlaceholderText('Search services...')
    await userEvent.type(searchInput, 'cleaning')

    await waitFor(() => {
      expect(servicesApiModule.servicesApi.getServices).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'cleaning' }),
      )
    })
  })
})
