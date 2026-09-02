import type { TimeSlot } from '../types'

interface TimeSlotSelectorProps {
  slots: TimeSlot[]
  selectedSlotId: string
  onSelect: (slotId: string) => void
}

export function TimeSlotSelector({ slots, selectedSlotId, onSelect }: TimeSlotSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const isSelected = slot.id === selectedSlotId
        return (
          <button
            key={slot.id}
            type="button"
            disabled={!slot.available}
            onClick={() => onSelect(slot.id)}
            className={`py-2 px-3 text-sm rounded-md border font-medium transition-colors ${!slot.available
              ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
              : isSelected
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
              }`}
          >
            {slot.time}
            {!slot.available && (
              <span className="block text-xs font-normal opacity-60">Booked</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
