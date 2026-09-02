import { create } from 'zustand'
interface BookingDraft {
  serviceId: string | null
  date: string
  timeSlotId: string
  addressId: string
  notes: string
}

interface BookingDraftStore extends BookingDraft {
  setField: <K extends keyof BookingDraft>(field: K, value: BookingDraft[K]) => void
  setServiceId: (serviceId: string) => void
  clearDraft: () => void
}

const defaultDraft: BookingDraft = {
  serviceId: null,
  date: new Date().toISOString().split('T')[0],
  timeSlotId: '',
  addressId: '',
  notes: '',
}

// keep booking form draft in Zustand so user selections survive page navigation without hitting server
export const useBookingDraftStore = create<BookingDraftStore>((set) => ({
  ...defaultDraft,

  setField: (field, value) => set((state) => ({ ...state, [field]: value })),

  setServiceId: (serviceId) =>
    set((state) => {
      if (state.serviceId !== serviceId) {
        return { ...defaultDraft, serviceId }
      }
      return state
    }),

  clearDraft: () => set({ ...defaultDraft }),
}))
