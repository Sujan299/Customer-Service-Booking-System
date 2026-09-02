import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiCall, client } from '../api/client'
import type { Service, Availability, Booking, Address, ServiceFilters, CreateBookingRequest } from '../types'

// fakeBaseQuery lets us wrap our async client functions while keeping RTK Query
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Bookings', 'Booking', 'Availability'],
  endpoints: (builder) => ({
    getServices: builder.query<Service[], ServiceFilters | void>({
      queryFn: async (filters) => {
        try {
          const data = await apiCall(() => client.getServices(filters ? filters : undefined))
          return { data }
        } catch (error) {
          return { error }
        }
      },
    }),

    getServiceById: builder.query<Service, string>({
      queryFn: async (id) => {
        try {
          const data = await apiCall(() => client.getServiceById(id))
          return { data }
        } catch (error) {
          return { error }
        }
      },
    }),

    getAvailability: builder.query<Availability, { serviceId: string; date: string }>({
      queryFn: async ({ serviceId, date }) => {
        try {
          const data = await apiCall(() => client.getAvailability(serviceId, date))
          return { data }
        } catch (error) {
          return { error }
        }
      },
      providesTags: (_result, _error, { serviceId, date }) => [
        { type: 'Availability', id: `${serviceId}-${date}` },
      ],
    }),

    getBookings: builder.query<Booking[], void>({
      queryFn: async () => {
        try {
          const data = await apiCall(() => client.getBookings())
          return { data }
        } catch (error) {
          return { error }
        }
      },
      providesTags: ['Bookings'],
    }),

    getBookingById: builder.query<Booking, string>({
      queryFn: async (id) => {
        try {
          const data = await apiCall(() => client.getBookingById(id))
          return { data }
        } catch (error) {
          return { error }
        }
      },
      providesTags: (_result, _error, id) => [{ type: 'Booking', id }],
    }),

    createBooking: builder.mutation<Booking, CreateBookingRequest>({
      queryFn: async (request) => {
        try {
          const data = await apiCall(() => client.createBooking(request))
          return { data }
        } catch (error) {
          return { error }
        }
      },
      invalidatesTags: (_result, _error, { serviceId, date }) => [
        'Bookings',
        { type: 'Availability', id: `${serviceId}-${date}` },
      ],
    }),

    getAddresses: builder.query<Address[], void>({
      queryFn: async () => {
        try {
          const data = await apiCall(() => client.getAddresses())
          return { data }
        } catch (error) {
          return { error }
        }
      },
    }),
  }),
})

export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useGetAvailabilityQuery,
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useGetAddressesQuery,
} = apiSlice
