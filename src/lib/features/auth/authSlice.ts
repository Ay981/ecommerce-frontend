import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user?: User; token: string; refreshToken?: string }>) => {
      const { user, token, refreshToken } = action.payload
      if (user) state.user = user
      state.token = token
      if (refreshToken) state.refreshToken = refreshToken
      state.isAuthenticated = true
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      
      // Remove token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
  },
})

export const { setCredentials, logout, updateUser } = authSlice.actions
export default authSlice.reducer
