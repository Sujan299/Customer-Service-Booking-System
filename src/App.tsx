import { BrowserRouter, Routes, Route, Navigate, RouterProvider } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ServiceListPage } from './features/services/ServiceListPage'
import {Provider} from 'react-redux'
import { store } from './store'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
            <Navbar />
             <main>
            <Routes>
              <Route path="/" element={<Navigate to="/services" replace />} />
              <Route path="/services" element={<ServiceListPage />} />
            </Routes>
          </main>
          </div>
        </BrowserRouter>
    </Provider>
  )
}

export default App
