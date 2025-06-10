import { useAuthStore } from '@/stores/auth'

export function Navbar() {
  const { user, logout } = useAuthStore()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">KM Platform</h1>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
          <button
            onClick={logout}
            className="btn-ghost text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
} 