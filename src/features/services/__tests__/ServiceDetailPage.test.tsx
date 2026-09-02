import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ServiceDetailPage } from '../ServiceDetailPage'
import { apiSlice } from '../../../store/apiSlice'
import notificationsReducer from '../../../store/notificationsSlice'
import * as servicesApiModule from '../../../api/services/servicesApi'
import type { Service } from '../../../types'

vi.mock('../../../api/services/servicesApi')

const mockService: Service = {
  id: 's1',
  name: 'Home Cleaning',
  category: 'Cleaning',
  description: 'Professional deep cleaning for your home.',
  providerId: 'p1',
  provider: { id: 'p1', name: 'CleanPro Services', phone: '9841000001' },
  price: 1500,
  currency: 'NPR',
  durationMinutes: 180,
  rating: 4.7,
  reviewCount: 214,
  available: true,
}

function makeStore() {
  return configureStore({
    reducer: {
      notifications: notificationsReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  })
}

function renderWithProviders(serviceId: string) {
  return render(
    <ReduxProvider store={makeStore()}>
      <MemoryRouter initialEntries={[`/services/${serviceId}`]}>
        <Routes>
          <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    </ReduxProvider>,
  )
}

describe('ServiceDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders service information correctly', async () => {
    vi.mocked(servicesApiModule.servicesApi.getServiceById).mockResolvedValue(mockService)

    renderWithProviders('s1')

    await waitFor(() => {
      expect(screen.getByText('Home Cleaning')).toBeInTheDocument()
      expect(screen.getByText('CleanPro Services')).toBeInTheDocument()
      expect(screen.getByText('Professional deep cleaning for your home.')).toBeInTheDocument()
      expect(screen.getByText('NPR 1,500')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /book now/i })).toBeInTheDocument()
    })
  })

  it('shows a not-found message for unknown service IDs', async () => {
    vi.mocked(servicesApiModule.servicesApi.getServiceById).mockRejectedValue({
      status: 404,
      code: 'NOT_FOUND',
      message: 'Service not found.',
    })

    renderWithProviders('invalid-id')

    await waitFor(() => {
      expect(screen.getByText('Service not found')).toBeInTheDocument()
    })
  })

  it('shows a generic error state on server errors', async () => {
    vi.mocked(servicesApiModule.servicesApi.getServiceById).mockRejectedValue({
      status: 500,
      code: 'SERVER_ERROR',
      message: 'Something went wrong while loading the service.',
    })

    renderWithProviders('s1')

    await waitFor(() => {
      expect(screen.getByText('Something went wrong while loading the service.')).toBeInTheDocument()
    })
  })
})
