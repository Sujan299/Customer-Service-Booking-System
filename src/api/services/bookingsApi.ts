import type { CreateBookingRequest } from '../../types'
import { apiCall, client } from '../client'

export const bookingsApi = {
  createBooking: (request: CreateBookingRequest) => apiCall(() => client.createBooking(request)),
  getBookings: () => apiCall(() => client.getBookings()),
  getBookingById: (id: string) => apiCall(() => client.getBookingById(id)),
  getAddresses: () => apiCall(() => client.getAddresses()),
}
