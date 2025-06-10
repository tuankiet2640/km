// User types
export interface User {
  id: string
  username: string
  email: string
  full_name?: string
  role: 'admin' | 'user'
  is_active: boolean
  is_verified: boolean
  avatar_url?: string
  bio?: string
  created_at: string
  updated_at: string
  last_login_at?: string
}

// Auth types
export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  full_name?: string
}

export interface AuthToken {
  access_token: string
  token_type: string
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
  status: number
} 