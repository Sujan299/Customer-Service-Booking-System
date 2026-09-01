import { Link, NavLink } from 'react-router-dom'

export function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/services" className="text-lg font-semibold text-gray-900 tracking-tight">
          Demo Marketplace
        </Link>
        <nav className="flex items-center gap-6">
          <NavLink
            to="/services"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Services
          </NavLink>
          <NavLink
            to="/bookings"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            My Bookings
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
