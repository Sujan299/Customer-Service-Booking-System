# Architecture

## Overview

Demo Marketplace is a frontend-only React application. There is no real backend. Instead, a Promise-based mock API layer simulates HTTP behavior — latency, validation, structured errors, and state — so the frontend is developed exactly as it would be against a real API.

## Data Flow

```
UI (React components)
    ↓
Feature Pages
(ServiceListPage, BookingPage, etc.)
    ↓ RTK Query hooks (useGetServicesQuery, useCreateBookingMutation, etc.)
RTK Query API Slice
(store/apiSlice.ts — endpoints, caching, tag invalidation)
    ↓
API Client
(client.ts — normalizes errors into ApiError)
    ↓
Mock API
(mockApi.ts — stateful, validates, delays)
    ↓
Mock Data
(data.ts — seed services, providers, addresses, bookings)
```

## Replacing the Mock API

To switch to a real HTTP backend, only `src/api/client.ts` needs to change. The `client` object currently delegates to `mockApi`. Replace those calls with `fetch` or `axios` against real endpoints and nothing outside the API layer changes.

## Folder Structure

```
src/
├── api/
│   ├── client.ts              # Application-facing API boundary
│   ├── services/
│   │   ├── servicesApi.ts     # Service-related endpoints
│   │   └── bookingsApi.ts     # Booking-related endpoints
│   └── mock/
│       ├── mockApi.ts         # Stateful mock implementation
│       ├── data.ts            # Seed data (services, providers, addresses, bookings)
│       └── config.ts          # Developer toggles for error simulation
│
├── features/
│   ├── services/
│   │   ├── ServiceListPage.tsx
│   │   ├── ServiceDetailPage.tsx
│   │   └── __tests__/
│   ├── booking/
│   │   ├── BookingPage.tsx
│   │   ├── BookingConfirmationPage.tsx
│   │   └── __tests__/
│   └── bookings/
│       ├── BookingsPage.tsx
│       └── BookingDetailPage.tsx
│
├── components/
│   ├── Navbar.tsx
│   ├── NotificationToast.tsx  # Reads from Redux notifications slice
│   ├── ServiceCard.tsx
│   ├── ServiceFilters.tsx
│   ├── TimeSlotSelector.tsx
│   ├── BookingSummary.tsx
│   ├── BookingCard.tsx
│   ├── LoadingState.tsx
│   ├── ErrorState.tsx
│   └── EmptyState.tsx
│
├── store/                     # Redux Toolkit
│   ├── index.ts               # configureStore (includes RTK Query middleware)
│   ├── apiSlice.ts            # RTK Query endpoints — all server state
│   ├── hooks.ts               # Typed useAppDispatch / useAppSelector
│   └── notificationsSlice.ts  # Global toast notification state
│
├── stores/                    # Zustand
│   └── bookingDraftStore.ts   # Booking form draft (persists across navigation)
│
├── lib/
│   └── constants.ts           # UI constants (service categories)
│
├── types/
│   └── index.ts               # All domain and API types
│
└── test/
    └── setup.ts
```

## Feature Boundaries

Each feature folder owns its pages. Components in `src/components/` are shared across all features. No feature imports from another feature's internal files.

## State Management

The app uses three separate tools, each with a distinct, non-overlapping responsibility:

| State type | Tool | Reason |
|---|---|---|
| Server state (services, bookings, availability, addresses) | **RTK Query** (`apiSlice`) | Caching, background refetch, tag-based invalidation after mutations |
| Booking form state | **React Hook Form + Zod** | Isolated form state with schema validation |
| Booking draft (persists across navigation) | **Zustand** (`bookingDraftStore`) | Selections survive navigating back/forward between pages |
| Global UI notifications (toasts) | **Redux Toolkit** (`notificationsSlice`) | Cross-cutting state dispatched from any feature, rendered at app root |
| Local UI state (search, category filter) | **React `useState`** | Scoped to a single component, no sharing needed |

### Why this split?

- **RTK Query** owns anything that comes from or goes to the API. It lives inside the Redux store (`apiSlice.reducerPath`), so there is a single `<Provider>` at the app root — no separate `QueryClientProvider` needed. Cache invalidation is declarative via `providesTags` / `invalidatesTags`.
- **Zustand** handles client-side state that lives longer than a single component's lifecycle. The booking draft is a good fit: it persists if the user navigates to service detail and back, and it clears automatically on booking success or when switching services.
- **Redux Toolkit** handles truly app-level UI state. Notifications need to be dispatchable from deep inside any feature (booking success, booking error, future account actions) and rendered at the app root — a global store is the right tool for this.
- **React state** remains for anything local that doesn't need any of the above.

## Error Handling

Three distinct error types:

1. **Validation errors** — React Hook Form / Zod prevents submission, inline field errors shown.
2. **Business errors** — API returns structured `ApiError` (e.g. 409 `SLOT_UNAVAILABLE`). A Redux notification is dispatched, availability is refetched, and the slot selection is cleared.
3. **Technical/server errors** — `ErrorState` component shown with a retry button. A Redux error notification is also dispatched. Raw error details are never exposed to users.

`client.ts` normalizes all thrown values into a consistent `ApiError` shape so feature code only handles one error type.

## Component Responsibilities

- **Pages** — fetch data via RTK Query hooks, compose components, handle page-level states
- **Shared components** — purely presentational, receive data/callbacks via props
- **API services** — only call `apiCall()` + `client.*` — no React, no state
- **Mock API** — only mock logic + in-memory state — no React, no imports from feature code

## Routing

```
/                           → redirect to /services
/services                   → ServiceListPage
/services/:serviceId        → ServiceDetailPage
/services/:serviceId/book   → BookingPage
/booking-confirmation/:id   → BookingConfirmationPage
/bookings                   → BookingsPage
/bookings/:bookingId        → BookingDetailPage
```
