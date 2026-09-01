# Setup

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher

## Installation

```bash
npm install
```

This installs all dependencies including React, React Router, TanStack Query, Redux Toolkit, Zustand, React Hook Form, Zod, and Tailwind CSS.

## Environment Configuration

No environment variables are required. The application uses a mock API with no external services.

## Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Running Tests

```bash
npm run test
```

To run in watch mode:

```bash
npm run test:watch
```

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. Serve with:

```bash
npm run preview
```

---

## How the Mock API Works

The application has no real backend. All data fetching goes through a Promise-based mock API defined in `src/api/mock/mockApi.ts`.

The mock API:

- Returns Promises that resolve after a configurable delay (default 600ms)
- Maintains in-memory state for bookings (persists for the duration of the browser session)
- Validates incoming requests and returns structured errors
- Enforces business rules (slot conflicts, 404s, required fields)


### Seed Data

The mock API is pre-seeded with:

- 8 services (Home Cleaning, Plumbing Repair, AC Service, Electrician, Beauty at Home, Appliance Repair, Pest Control, Water Tank Cleaning)
- 4 providers
- 3 addresses (Home, Office, Parents Home)
- 2 pre-existing bookings in My Bookings
- 8 time slots per service/date combination

All prices are in NPR (Nepalese Rupees).
