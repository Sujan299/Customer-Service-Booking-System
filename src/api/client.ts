import type { ApiError } from '../types'
import * as mockApi from './mock/mockApi'

function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    'code' in err &&
    'message' in err
  )
}

export async function apiCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (isApiError(err)) {
      throw err
    }
    throw {
      status: 500,
      code: 'UNEXPECTED_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    } satisfies ApiError
  }
}

export const client = {
  getServices: mockApi.getServices,
  getServiceById: mockApi.getServiceById,
  getAvailability: mockApi.getAvailability,
  createBooking: mockApi.createBooking,
  getBookings: mockApi.getBookings,
  getBookingById: mockApi.getBookingById,
  getAddresses: mockApi.getAddresses,
}
