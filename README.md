# Demo Marketplace

A frontend-only Customer Service Booking System built as a technical assignment.

**Demo:** `https://jam.dev/c/9a5ca193-e01b-49e3-91b7-121a0433717e`
**Repository:** `https://github.com/Sujan299/Customer-Service-Booking-System`
**Author:** `Sujan Chaudhary`

---

## Project Overview

Demo Marketplace lets customers browse home services, select available time slots, and confirm bookings. The application is entirely frontend-based, backed by a Promise-based mock API that simulates realistic HTTP behavior including latency, validation, conflict errors, and server errors.

---

## Features

- Browse and search services by name, category, or provider
- Filter by category
- View full service details and availability
- Book a service with date, time slot, address, and notes
- Real-time booking validation (React Hook Form + Zod)
- Server-side slot conflict simulation (409 response)
- Booking confirmation page
- My Bookings list and detail view
- Loading, error, and empty states throughout

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 + TypeScript | UI and type safety |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| Redux Toolkit + RTK Query | Global UI state (notifications) and server state (caching, invalidation, mutations) |
| Zustand | Booking draft persistence across navigation |
| React Hook Form + Zod | Form state and validation |
| Tailwind CSS v4 | Styling |
| Vitest + React Testing Library | Testing |

---

## Architecture

```
UI Components
    ↓
Feature Pages (services/, booking/, bookings/)
    ↓                             ↓
RTK Query hooks             Zustand (booking draft)
(store/apiSlice.ts)         Redux Toolkit (notifications)
    ↓
API Client (client.ts — normalizes errors)
    ↓
Mock API (mockApi.ts — stateful, validates, delays)
    ↓
Mock Data (data.ts)
```

See [`docs/architecture.md`](docs/architecture.md) for full detail.

---

## Project Structure

```
src/
├── api/
│   ├── client.ts              
│   ├── services/
│   │   ├── servicesApi.ts     
│   │   └── bookingsApi.ts   
│   └── mock/
│       ├── mockApi.ts        
│       ├── data.ts           
│       └── config.ts         
├── features/
│   ├── services/            
│   ├── booking/              
│   └── bookings/              
├── components/             
├── store/                     
├── stores/                   
├── types/
│   └── index.ts             
└── test/
    └── setup.ts
```

---

## Getting Started

```bash
npm install
npm run dev
```

See [`docs/setup.md`](docs/setup.md) for full setup instructions.

---

## Testing

```bash
npm run test
```

Tests cover service listing, service details, booking validation, successful booking, and 409 slot conflict handling.

---

## Mock API

The app uses a Promise-based mock API (`src/api/mock/mockApi.ts`) instead of a real backend. It:

- Simulates network latency (600ms by default)
- Maintains in-memory state (bookings persist within the session)
- Validates requests and returns structured errors
- Enforces business rules (slot conflicts, 404s, etc.)

Developer flags in `src/api/mock/config.ts`:

```ts
mockConfig.simulateServerError = true  
mockConfig.simulateSlotConflict = true  
mockConfig.networkDelay = 0             
```

---

## Technical Decisions

See [`docs/decisions.md`](docs/decisions.md) for detailed rationale.
