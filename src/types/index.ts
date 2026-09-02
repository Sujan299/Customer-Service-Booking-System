export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'pending'

export interface Provider {
  id: string
  name: string
  phone: string
}

export interface Service {
  id: string
  name: string
  category: string
  description: string
  providerId: string
  provider: Provider
  price: number
  currency: string
  durationMinutes: number
  rating: number
  reviewCount: number
  available: boolean
}

export interface TimeSlot {
  id: string
  time: string
  available: boolean
}

export interface Availability {
  serviceId: string
  date: string
  slots: TimeSlot[]
}

export interface Address {
  id: string
  label: string
  line1: string
  city: string
  district: string
}

export interface Booking {
  id: string
  bookingNumber: string
  serviceId: string
  service: Service
  providerId: string
  provider: Provider
  date: string
  timeSlot: TimeSlot
  address: Address
  status: BookingStatus
  createdAt: string
  notes?: string
}

export interface CreateBookingRequest {
  serviceId: string
  date: string
  timeSlotId: string
  addressId: string
  notes?: string
}

export interface ApiError {
  status: number
  code: string
  message: string
}

export interface ApiResponse<T> {
  data: T
}

export interface ServiceFilters {
  search?: string
  category?: string
}
