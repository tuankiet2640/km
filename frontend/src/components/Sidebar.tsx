import { Link, useLocation } from 'react-router-dom'

export function Sidebar() {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Datasets', href: '/datasets', icon: '📚' },
    { name: 'Models', href: '/models', icon: '⚙️' },
    { name: 'Applications', href: '/applications', icon: '🤖' },
    { name: 'Chat', href: '/chat', icon: '💬' },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">KM</h1>
      </div>
      
      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 