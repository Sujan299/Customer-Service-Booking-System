# API Contract

All endpoints are implemented as Promise-based functions in `src/api/mock/mockApi.ts`. This document describes the contract that a real backend would need to fulfil.

Base URL: `/api/v1`

---

## GET /services

Fetch a list of services, optionally filtered.

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `search` | string (optional) | Filters by service name, category, or provider name |
| `category` | string (optional) | Filters to an exact category match |

### Success Response — 200

```json
[
  {
    "id": "s1",
    "name": "Home Cleaning",
    "category": "Cleaning",
    "description": "Professional deep cleaning...",
    "providerId": "p1",
    "provider": {
      "id": "p1",
      "name": "CleanPro Services",
      "phone": "9841000001"
    },
    "price": 1500,
    "currency": "NPR",
    "durationMinutes": 180,
    "rating": 4.7,
    "reviewCount": 214,
    "available": true
  }
]
```

### Empty Response — 200

Returns an empty array when no services match the filters:

```json
[]
```

### Error — 500

```json
{ "status": 500, "code": "SERVER_ERROR", "message": "Something went wrong while loading services." }
```

---

## GET /services/:serviceId

Fetch a single service by ID.

### Path Parameters

| Parameter | Description |
|---|---|
| `serviceId` | The service's unique ID |

### Success Response — 200

Returns a single `Service` object (same shape as above).

### Error — 404

```json
{ "status": 404, "code": "NOT_FOUND", "message": "Service not found." }
```

### Error — 500

```json
{ "status": 500, "code": "SERVER_ERROR", "message": "Something went wrong while loading the service." }
```

---

## GET /services/:serviceId/availability

Fetch available time slots for a service on a given date.

### Path Parameters

| Parameter | Description |
|---|---|
| `serviceId` | The service's unique ID |

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `date` | string (YYYY-MM-DD) | The date to check availability for |

### Success Response — 200

```json
{
  "serviceId": "s1",
  "date": "2026-09-10",
  "slots": [
    { "id": "slot-1", "time": "09:00 AM", "available": true },
    { "id": "slot-2", "time": "10:00 AM", "available": true },
    { "id": "slot-3", "time": "11:00 AM", "available": false },
    { "id": "slot-4", "time": "12:00 PM", "available": true },
    { "id": "slot-5", "time": "02:00 PM", "available": true },
    { "id": "slot-6", "time": "03:00 PM", "available": false },
    { "id": "slot-7", "time": "04:00 PM", "available": true },
    { "id": "slot-8", "time": "05:00 PM", "available": true }
  ]
}
```

### Error — 404

```json
{ "status": 404, "code": "NOT_FOUND", "message": "Service not found." }
```

---

## POST /bookings

Create a new booking.

### Request Body

```json
{
  "serviceId": "s1",
  "date": "2026-09-10",
  "timeSlotId": "slot-2",
  "addressId": "a1",
  "notes": "Please bring eco-friendly supplies."
}
```

### Success Response — 200

```json
{
  "id": "b1234567890",
  "bookingNumber": "BK-003",
  "serviceId": "s1",
  "service": { ... },
  "providerId": "p1",
  "provider": { ... },
  "date": "2026-09-10",
  "timeSlot": { "id": "slot-2", "time": "10:00 AM", "available": false },
  "address": { ... },
  "status": "confirmed",
  "createdAt": "2026-09-01T13:00:00.000Z",
  "notes": "Please bring eco-friendly supplies."
}
```

### Error — 400 (Validation)

```json
{ "status": 400, "code": "VALIDATION_ERROR", "message": "Missing required booking fields." }
```

### Error — 404

```json
{ "status": 404, "code": "NOT_FOUND", "message": "Service not found." }
```

### Error — 409 (Slot Conflict)

Returned when the selected time slot was available when shown to the user, but was booked by someone else before the request was submitted.

```json
{ "status": 409, "code": "SLOT_UNAVAILABLE", "message": "The selected time slot is no longer available." }
```

The frontend handles this by:
1. Showing a user-friendly error message
2. Not treating it as a successful booking
3. Refreshing availability so the user can select a different slot

---

## GET /bookings

Fetch all bookings for the current user.

### Success Response — 200

Returns an array of `Booking` objects (same shape as POST response above). Returns an empty array if no bookings exist.

### Error — 500

```json
{ "status": 500, "code": "SERVER_ERROR", "message": "Something went wrong while loading bookings." }
```

---

## GET /bookings/:bookingId

Fetch a single booking by ID.

### Path Parameters

| Parameter | Description |
|---|---|
| `bookingId` | The booking's unique ID |

### Success Response — 200

Returns a single `Booking` object.

### Error — 404

```json
{ "status": 404, "code": "NOT_FOUND", "message": "Booking not found." }
```

---

## Error Shape

All errors follow this structure:

```ts
{
  status: number 
  code: string    
  message: string 
}
```

Error codes used in this application:

| Code | Status | Description |
|---|---|---|
| `SERVER_ERROR` | 500 | Unexpected server failure |
| `NOT_FOUND` | 404 | Resource does not exist |
| `VALIDATION_ERROR` | 400 | Request body failed validation |
| `SLOT_UNAVAILABLE` | 409 | Selected time slot is no longer available |
| `UNEXPECTED_ERROR` | 500 | Unhandled exception in client code |
