# Technical Decisions

---

## 1. React + TypeScript + Vite

**Chosen:** React 18 with TypeScript, built with Vite.

**Why:** This is the de-facto standard for modern React frontends in 2025. Vite's dev server starts instantly and HMR is fast. TypeScript catches type errors at compile time, which is especially useful across the API boundary where shapes need to stay consistent.

**Alternatives considered:**
- **Next.js** — Rejected. This is a pure SPA with no server-side rendering or file-based routing needs. Next.js would add unnecessary complexity for a client-only assignment.
- **Create React App** — Rejected. Unmaintained and significantly slower than Vite.

---

## 2. TanStack Query for server state

**Chosen:** TanStack Query (v5) for all data fetching.

**Why:** It handles loading/error/stale states, caching, and invalidation cleanly without manual `useEffect` chains. After a successful booking, invalidating `['bookings']` and `['availability']` automatically refreshes the relevant pages. This is exactly the kind of server state management problem TanStack Query solves well.

**Alternatives considered:**
- **SWR** — Viable, but TanStack Query has better mutation support and more explicit cache invalidation, which mattered for the booking flow.
- **Manual useEffect + fetch** — Rejected. Leads to duplicated loading/error state logic in every component and is harder to maintain.

---

## 3. React Hook Form + Zod for booking validation

**Chosen:** React Hook Form with Zod schema validation via `@hookform/resolvers`.

**Why:** The booking form has several required fields and needs clear inline validation errors before submission. React Hook Form avoids re-rendering on every keystroke and Zod provides a type-safe schema that doubles as the TypeScript type source of truth.

**Alternatives considered:**
- **Formik** — Heavier than React Hook Form and performs more re-renders. No strong reason to prefer it here.
- **Manual state validation** — Would require duplicating validation logic and managing error state manually. The form is simple but has enough fields to justify a library.

---

## 4. Promise-based mock API instead of a real backend

**Chosen:** A stateful in-memory mock API (`src/api/mock/mockApi.ts`) with simulated latency.

**Why:** The assignment specifies no real backend. A mock API that behaves like real HTTP (returns Promises, validates requests, maintains session state, returns structured errors) lets the frontend be built exactly as it would be for production. Replacing it with a real backend later requires only changing `src/api/client.ts`.

**Alternatives considered:**
- **MSW (Mock Service Worker)** — A valid choice for more complex scenarios. For this assignment, a direct Promise-based mock was simpler to set up and understand, and didn't require service worker configuration.
- **JSON files imported into components** — Rejected explicitly by the assignment requirements. Direct data imports bypass the API layer entirely and make the frontend tightly coupled to the mock.

---

## 5. Feature-based folder structure

**Chosen:** Group files by feature (`features/services/`, `features/booking/`, `features/bookings/`) rather than by type (`pages/`, `hooks/`, `utils/`).

**Why:** Feature co-location makes it easier to understand what belongs together. When working on booking, all relevant files are in one place. Tests live next to the files they test. Shared components that genuinely span features live in `src/components/`.

**Alternatives considered:**
- **Type-based grouping** (`pages/`, `containers/`, `presentational/`) — Gets unwieldy quickly. Finding related files requires jumping between folders.

---

## 6. State management — TanStack Query + Zustand + Redux Toolkit

**Chosen:** Three tools with clearly separated responsibilities.

**Why:** Each tool is used for the type of state it is designed for:

- **TanStack Query** — server state (services, bookings, availability, addresses). Handles caching, deduplication, background refetch, and cache invalidation after mutations. Using RTK Query on top would duplicate this and create two sources of truth for the same data.
- **Zustand** — booking draft state. When a user selects a date, time slot, and address on the booking page then navigates back to service detail, their selections are preserved. This state lives longer than a single component's lifecycle but does not need the overhead of Redux. Zustand's simple API (`create`, `set`) is ideal here.
- **Redux Toolkit** — global notification/toast state. Notifications (booking success, slot conflict error, server error) need to be dispatched from deep inside feature components and rendered at the app root by `NotificationToast`. This is a classic use case for a global store. RTK's `createSlice` keeps the reducer and action creators concise with zero boilerplate.
- **React state** — purely local UI state (search input, category filter) that no other component needs to read.

**Alternatives considered:**
- **Zustand for everything** — Would work but loses the structure and devtools of RTK for the notifications use case.
- **Redux for everything** — Over-engineered; booking draft and server state can be handled more cleanly by Zustand and TanStack Query respectively.
- **No global store** — Would require prop-drilling notifications from deep mutation callbacks all the way up to the app shell, or using a React context which is a manual re-implementation of what RTK already provides.

---

## 7. Tailwind CSS for styling

**Chosen:** Tailwind CSS v4.

**Why:** Utility-first CSS keeps styles co-located with components without needing separate CSS modules or styled-components. Tailwind v4's `@tailwindcss/vite` plugin integrates cleanly without a `tailwind.config.js`. The design is intentionally simple — a neutral marketplace style — which Tailwind handles well without needing a component library.

**Alternatives considered:**
- **CSS Modules** — Valid but more verbose for this project size. Tailwind moves faster for a time-boxed assignment.
- **shadcn/ui or Radix UI** — These add useful accessible primitives but also increase bundle size and complexity beyond what this assignment needs. The UI requirements don't justify a component library.

---

## 8. Why RTK Query was not used alongside Redux Toolkit

**Chosen:** TanStack Query for server state, Redux Toolkit only for UI state (notifications).

**Why:** RTK Query and TanStack Query solve the same problem — server state caching. Using both would mean two caches, two sets of query keys, and two invalidation systems for the same data. Since TanStack Query was already chosen for its excellent React integration and mutation/invalidation support, RTK Query was left out. Redux Toolkit's role is limited to what it does uniquely well: predictable, structured, global UI state with DevTools support.

**In a production codebase using Redux as the primary state manager**, RTK Query would be the natural choice and TanStack Query would be dropped. The combination here is a deliberate architectural decision: use each tool where it fits, avoid duplication.
