import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ServiceListPage } from './features/services/ServiceListPage'
import { ServiceDetailPage } from './features/services/ServiceDetailPage'
import {Provider} from 'react-redux'
import { store } from './store'
import { BookingPage } from './features/booking/BookingPage'
import { BookingConfirmationPage } from './features/booking/BookingConfirmationPage'

function App() {
  return (
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
            </Routes>
          </main>
          </div>
        </BrowserRouter>
    </Provider>
  )
}

export default App
