import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">DevCircle 🚀</Link>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link to="/matches" className="text-gray-600 hover:text-blue-500 text-sm">Matches</Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-500 text-sm">Dashboard</Link>
            <Link to="/create" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-semibold">
              + Post Card
            </Link>
            <span className="text-gray-600 text-sm">Hi, {user.username}</span>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 text-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-blue-500 text-sm">Log in</Link>
            <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}