import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useGetServiceByIdQuery,
  useGetAddressesQuery,
  useGetAvailabilityQuery,
  useCreateBookingMutation,
} from '../../store/apiSlice'
import { useAppDispatch } from '../../store/hooks'
import { addNotification } from '../../store/notificationsSlice'
import { LoadingState } from '../../components/LoadingState'
import { ErrorState } from '../../components/ErrorState'
import { TimeSlotSelector } from '../../components/TimeSlotSelector'
import { BookingSummary } from '../../components/BookingSummary'
import type { ApiError, TimeSlot } from '../../types'
import { useBookingDraftStore } from '../../stores/bookingDraftStore'

const bookingSchema = z.object({
  date: z.string().min(1, 'Please select a date'),
  timeSlotId: z.string().min(1, 'Please select a time slot'),
  addressId: z.string().min(1, 'Please select an address'),
  notes: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

function todayString() {
  return new Date().toISOString().split('T')[0]
}

export function BookingPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  // Zustand — booking draft persists across navigation so selections aren't lost
  const draft = useBookingDraftStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: draft.date || todayString(),
      timeSlotId: draft.timeSlotId,
      addressId: draft.addressId,
      notes: draft.notes,
    },
  })
  useEffect(() => {
    return () => {
      const current = getValues()
      draft.setField('date', current.date)
      draft.setField('timeSlotId', current.timeSlotId)
      draft.setField('addressId', current.addressId)
      draft.setField('notes', current.notes ?? '')
    }
  }, []) 

  const watchedDate = watch('date')
  const watchedSlot = watch('timeSlotId')
  const watchedAddress = watch('addressId')
  const watchedNotes = watch('notes')

  const { data: service, isLoading: serviceLoading, isError: serviceError } = useGetServiceByIdQuery(serviceId!, {
    skip: !serviceId,
  })

  useEffect(() => {
    if (serviceId) draft.setServiceId(serviceId)
  }, [serviceId]) 

  const { data: addressList = [] } = useGetAddressesQuery()

  const {
    data: availability,
    isLoading: availabilityLoading,
    refetch: refetchAvailability,
  } = useGetAvailabilityQuery(
    { serviceId: serviceId!, date: watchedDate },
    { skip: !serviceId || !watchedDate },
  )

  const [createBooking, mutation] = useCreateBookingMutation()

  const onSubmit = (data: BookingFormData) => {
    createBooking({
      serviceId: serviceId!,
      date: data.date,
      timeSlotId: data.timeSlotId,
      addressId: data.addressId,
      notes: data.notes,
    })
      .unwrap()
      .then((booking) => {
        draft.clearDraft()
        dispatch(
          addNotification({
            type: 'success',
            title: 'Booking confirmed!',
            message: `${booking.bookingNumber} — ${booking.service.name} on ${booking.date}`,
          }),
        )
        navigate(`/booking-confirmation/${booking.id}`)
      })
      .catch((err: ApiError) => {
        if (err.code === 'SLOT_UNAVAILABLE') {
          // Clear the stale slot selection from form and draft
          setValue('timeSlotId', '', { shouldValidate: false })
          draft.setField('timeSlotId', '')
          refetchAvailability()
          dispatch(
            addNotification({
              type: 'error',
              title: 'Slot no longer available',
              message: err.message + ' Please select another time.',
            }),
          )
        } else {
          dispatch(
            addNotification({
              type: 'error',
              title: 'Booking failed',
              message: err.message ?? 'Something went wrong. Please try again.',
            }),
          )
        }
      })
  }

  if (serviceLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <LoadingState message="Loading service..." />
      </div>
    )
  }

  if (serviceError || !service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ErrorState message="Failed to load service details." />
      </div>
    )
  }

  const selectedSlot: TimeSlot | undefined = availability?.slots.find(
    (s) => s.id === watchedSlot,
  )
  const selectedAddress = addressList.find((a) => a.id === watchedAddress)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to={`/services/${serviceId}`}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {service.name}
      </Link>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">Book a Service</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="md:col-span-3 space-y-6">
          {/* Date */}
          <div>
            <label htmlFor="booking-date" className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Date
            </label>
            <input
              id="booking-date"
              type="date"
              min={todayString()}
              {...register('date')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.date && (
              <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Time slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Time Slot
            </label>
            {availabilityLoading ? (
              <div className="py-4 text-center text-sm text-gray-400">Loading slots...</div>
            ) : availability && availability.slots.length > 0 ? (
              <TimeSlotSelector
                slots={availability.slots}
                selectedSlotId={watchedSlot}
                onSelect={(id) => setValue('timeSlotId', id, { shouldValidate: true })}
              />
            ) : (
              <p className="text-sm text-gray-400">No slots available for this date.</p>
            )}
            {errors.timeSlotId && (
              <p className="text-xs text-red-500 mt-1">{errors.timeSlotId.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="booking-address" className="block text-sm font-medium text-gray-700 mb-1.5">
              Service Address
            </label>
            <select
              id="booking-address"
              {...register('addressId')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Select address...</option>
              {addressList.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addr.label} — {addr.line1}, {addr.city}
                </option>
              ))}
            </select>
            {errors.addressId && (
              <p className="text-xs text-red-500 mt-1">{errors.addressId.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="booking-notes" className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="booking-notes"
              {...register('notes')}
              rows={3}
              placeholder="Any instructions for the service provider..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isLoading}
            className="w-full py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isLoading ? 'Confirming booking...' : 'Confirm Booking'}
          </button>
        </form>

        {/* Summary sidebar */}
        <div className="md:col-span-2">
          <p className="text-sm font-medium text-gray-700 mb-2">Booking Summary</p>
          <BookingSummary
            service={service}
            date={watchedDate}
            timeSlot={selectedSlot}
            address={selectedAddress}
            notes={watchedNotes}
          />
        </div>
      </div>
    </div>
  )
}
