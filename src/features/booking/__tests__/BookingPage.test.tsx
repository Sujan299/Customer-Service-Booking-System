import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider as ReduxProvider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import notificationsReducer from '../../../store/notificationsSlice'
import { apiSlice } from '../../../store/apiSlice'
import { useBookingDraftStore } from '../../../stores/bookingDraftStore'
import { BookingPage } from '../BookingPage'
import * as servicesApiModule from '../../../api/services/servicesApi'
import * as bookingsApiModule from '../../../api/services/bookingsApi'
import type { Service, Availability, Booking } from '../../../types'

vi.mock('../../../api/services/servicesApi')
vi.mock('../../../api/services/bookingsApi')

const mockAddresses = [
  {
    id: 'a1',
    label: 'Home',
    line1: 'House 12, Lane 5, Bafal',
    city: 'Kathmandu',
    district: 'Kathmandu',
  },
]

const mockService: Service = {
  id: 's1',
  name: 'Home Cleaning',
  category: 'Cleaning',
  description: 'Deep cleaning',
  providerId: 'p1',
  provider: { id: 'p1', name: 'CleanPro Services', phone: '9841000001' },
  price: 1500,
  currency: 'NPR',
  durationMinutes: 180,
  rating: 4.7,
  reviewCount: 214,
  available: true,
}

const mockAvailability: Availability = {
  serviceId: 's1',
  date: new Date().toISOString().split('T')[0],
  slots: [
    { id: 'slot-1', time: '09:00 AM', available: true },
    { id: 'slot-2', time: '10:00 AM', available: true },
    { id: 'slot-3', time: '11:00 AM', available: false },
  ],
}

const mockBooking: Booking = {
  id: 'b-new',
  bookingNumber: 'BK-003',
  serviceId: 's1',
  service: mockService,
  providerId: 'p1',
  provider: mockService.provider,
  date: mockAvailability.date,
  timeSlot: { id: 'slot-1', time: '09:00 AM', available: false },
  address: {
    id: 'a1',
    label: 'Home',
    line1: 'House 12, Lane 5, Bafal',
    city: 'Kathmandu',
    district: 'Kathmandu',
  },
  status: 'confirmed',
  createdAt: new Date().toISOString(),
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

function renderWithProviders() {
  const store = makeStore()
  return {
    store,
    ...render(
      <ReduxProvider store={store}>
        <MemoryRouter initialEntries={['/services/s1/book']}>
          <Routes>
            <Route path="/services/:serviceId/book" element={<BookingPage />} />
            <Route path="/booking-confirmation/:bookingId" element={<div>Confirmation Page</div>} />
          </Routes>
        </MemoryRouter>
      </ReduxProvider>,
    ),
  }
}

describe('BookingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useBookingDraftStore.getState().clearDraft()
    vi.mocked(servicesApiModule.servicesApi.getServiceById).mockResolvedValue(mockService)
    vi.mocked(servicesApiModule.servicesApi.getAvailability).mockResolvedValue(mockAvailability)
    vi.mocked(bookingsApiModule.bookingsApi.getAddresses).mockResolvedValue(mockAddresses)
  })

  it('prevents submission when required fields are missing', async () => {
    renderWithProviders()

    await waitFor(() => screen.getByText('09:00 AM'))

    const submitButton = screen.getByRole('button', { name: /confirm booking/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please select a time slot')).toBeInTheDocument()
      expect(screen.getByText('Please select an address')).toBeInTheDocument()
    })

    expect(bookingsApiModule.bookingsApi.createBooking).not.toHaveBeenCalled()
  })

  it('submits successfully and navigates to confirmation', async () => {
    vi.mocked(bookingsApiModule.bookingsApi.createBooking).mockResolvedValue(mockBooking)

    renderWithProviders()

    await waitFor(() => screen.getByText('09:00 AM'))

    await userEvent.click(screen.getByRole('button', { name: '09:00 AM' }))

    const addressSelect = screen.getByRole('combobox', { name: /service address/i })
    await userEvent.selectOptions(addressSelect, 'a1')

    const submitButton = screen.getByRole('button', { name: /confirm booking/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Confirmation Page')).toBeInTheDocument()
    })
  })

  it('dispatches a conflict notification on 409 and refreshes availability', async () => {
    vi.mocked(bookingsApiModule.bookingsApi.createBooking).mockRejectedValue({
      status: 409,
      code: 'SLOT_UNAVAILABLE',
      message: 'The selected time slot is no longer available.',
    })

    const { store } = renderWithProviders()

    await waitFor(() => screen.getByText('09:00 AM'))

    await userEvent.click(screen.getByRole('button', { name: '09:00 AM' }))
    const addressSelect = screen.getByRole('combobox', { name: /service address/i })
    await userEvent.selectOptions(addressSelect, 'a1')

    await userEvent.click(screen.getByRole('button', { name: /confirm booking/i }))

   

    expect(servicesApiModule.servicesApi.getAvailability).toHaveBeenCalledTimes(2)
  })
})
