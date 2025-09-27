import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
      
      // Persist token to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      
      // Remove token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
  },
})

export const { setCredentials, logout, updateUser } = authSlice.actions
export default authSlice.reducer
