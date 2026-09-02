import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { Navbar } from './components/Navbar'

import { Provider } from 'react-redux'
import { store } from './store'

import { ServiceListPage } from './features/services/ServiceListPage'
import { ServiceDetailPage } from './features/services/ServiceDetailPage'
import { BookingPage } from './features/booking/BookingPage'
import { BookingConfirmationPage } from './features/booking/BookingConfirmationPage'
import { BookingsPage } from './features/bookings/BookingsPage'
import { BookingDetailPage } from './features/bookings/BookingDetailPage'

function App() {
  return (
    // wrapping the redux store so that store will be accessible to all file in the app
    <Provider store={store}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>

              <Route path="/" element={<Navigate to="/services" replace />} />
              <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
              <Route path="/services" element={<ServiceListPage />} />
              <Route path="/services/:serviceId/book" element={<BookingPage />} />
              <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmationPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/bookings/:bookingId" element={<BookingDetailPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </Provider>
  )
}

export default App
