import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Layout } from '@/components/Layout'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { Dashboard } from '@/pages/Dashboard'
import { Datasets } from '@/pages/Datasets'
import { Applications } from '@/pages/Applications'
import { Chat } from '@/pages/Chat'
import { ProtectedRoute } from '@/components/ProtectedRoute'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="datasets" element={<Datasets />} />
          <Route path="applications" element={<Applications />} />
          <Route path="chat/:id?" element={<Chat />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App 