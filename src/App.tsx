import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'

function App() {
  return (
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            
          </div>
        </BrowserRouter>
  )
}

export default App
