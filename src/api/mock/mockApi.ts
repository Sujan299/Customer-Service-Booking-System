import type {
  Service,
  Availability,
  Booking,
  CreateBookingRequest,
  ApiError,
  ServiceFilters,
  TimeSlot,
  Address,
} from '../../types'
import { services as mockServices, addresses, baseSlots, seedBookings } from './data'
import { mockConfig } from './config'

let bookings: Booking[] = [...seedBookings]

const bookedSlots: Record<string, Set<string>> = {
  's1_2026-08-25': new Set(['slot-2']),
  's4_2026-09-05': new Set(['slot-4']),
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function makeError(status: number, code: string, message: string): ApiError {
  return { status, code, message }
}

function getSlotsForKey(key: string): TimeSlot[] {
  const booked = bookedSlots[key] ?? new Set()
  return baseSlots.map((slot) => ({
    ...slot,
    available: slot.available && !booked.has(slot.id),
  }))
}


export async function getServices(filters: ServiceFilters = {}): Promise<Service[]> {
  await delay(mockConfig.networkDelay)

  if (mockConfig.simulateServerError) {
    throw makeError(500, 'SERVER_ERROR', 'Something went wrong while loading services.')
  }

  let results = [...mockServices]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.provider.name.toLowerCase().includes(q),
    )
  }

  if (filters.category) {
    results = results.filter((s) => s.category === filters.category)
  }

  return results
}

export async function getServiceById(serviceId: string): Promise<Service> {
  await delay(mockConfig.networkDelay)

  if (mockConfig.simulateServerError) {
    throw makeError(500, 'SERVER_ERROR', 'Something went wrong while loading the service.')
  }

  const service = mockServices.find((s) => s.id === serviceId)
  if (!service) {
    throw makeError(404, 'NOT_FOUND', 'Service not found.')
  }

  return service
}

export async function getAvailability(serviceId: string, date: string): Promise<Availability> {
  await delay(mockConfig.networkDelay)

  if (mockConfig.simulateServerError) {
    throw makeError(500, 'SERVER_ERROR', 'Something went wrong while loading availability.')
  }

  const service = mockServices.find((s) => s.id === serviceId)
  if (!service) {
    throw makeError(404, 'NOT_FOUND', 'Service not found.')
  }

  const key = `${serviceId}_${date}`
  return {
    serviceId,
    date,
    slots: getSlotsForKey(key),
  }
}

export async function createBooking(request: CreateBookingRequest): Promise<Booking> {
  await delay(mockConfig.networkDelay)

  if (!request.serviceId || !request.date || !request.timeSlotId || !request.addressId) {
    throw makeError(400, 'VALIDATION_ERROR', 'Missing required booking fields.')
  }

  const service = mockServices.find((s) => s.id === request.serviceId)
  if (!service) {
    throw makeError(404, 'NOT_FOUND', 'Service not found.')
  }

  const address = addresses.find((a) => a.id === request.addressId)
  if (!address) {
    throw makeError(400, 'VALIDATION_ERROR', 'Invalid address.')
  }

  const timeSlot = baseSlots.find((s) => s.id === request.timeSlotId)
  if (!timeSlot) {
    throw makeError(400, 'VALIDATION_ERROR', 'Invalid time slot.')
  }

  const key = `${request.serviceId}_${request.date}`
  const booked = bookedSlots[key] ?? new Set()

  const isSlotTaken = !timeSlot.available || booked.has(request.timeSlotId)

  // Throw 409 conflict if another user booked the slot concurrently
  if (isSlotTaken || mockConfig.simulateSlotConflict) {
    if (mockConfig.simulateSlotConflict) {
      mockConfig.simulateSlotConflict = false
    }
    throw makeError(409, 'SLOT_UNAVAILABLE', 'The selected time slot is no longer available.')
  }

  const bookingNumber = `BK-${String(bookings.length + 1).padStart(3, '0')}`
  const newBooking: Booking = {
    id: `b${Date.now()}`,
    bookingNumber,
    serviceId: service.id,
    service,
    providerId: service.providerId,
    provider: service.provider,
    date: request.date,
    timeSlot: { ...timeSlot, available: false },
    address,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    notes: request.notes,
  }

  if (!bookedSlots[key]) {
    bookedSlots[key] = new Set()
  }
  bookedSlots[key].add(request.timeSlotId)
  bookings = [newBooking, ...bookings]

  return newBooking
}

export async function getBookings(): Promise<Booking[]> {
  await delay(mockConfig.networkDelay)

  if (mockConfig.simulateServerError) {
    throw makeError(500, 'SERVER_ERROR', 'Something went wrong while loading bookings.')
  }

  return [...bookings]
}

export async function getAddresses(): Promise<Address[]> {
  await delay(mockConfig.networkDelay)
  return [...addresses]
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  await delay(mockConfig.networkDelay)

  if (mockConfig.simulateServerError) {
    throw makeError(500, 'SERVER_ERROR', 'Something went wrong while loading booking details.')
  }

  const booking = bookings.find((b) => b.id === bookingId)
  if (!booking) {
    throw makeError(404, 'NOT_FOUND', 'Booking not found.')
  }

  return booking
}
