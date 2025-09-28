import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Product } from '@/lib/api'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
}

const initialState: CartState = {
  items: [],
  total: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ product: Product; quantity?: number }>) => {
      const { product, quantity = 1 } = action.payload
      const existingItem = state.items.find(item => item.product.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        state.items.push({ product, quantity })
      }
      
      // Recalculate total
      state.total = state.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    },
    removeItem: (state, action: PayloadAction<string>) => {
      const productId = action.payload
      state.items = state.items.filter(item => item.product.id !== productId)
      
      // Recalculate total
      state.total = state.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload
      const item = state.items.find(item => item.product.id === productId)
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.product.id !== productId)
        } else {
          item.quantity = quantity
        }
        
        // Recalculate total
        state.total = state.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      }
    },
    clearCart: (state) => {
      state.items = []
      state.total = 0
    },
  },
  extraReducers: (builder) => {
    // When server cart items load, clear any guest cart state
    // Use RTK Query matcher for getCartItems fulfilled
    builder.addMatcher(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (action: any) => action.type === 'api/executeQuery/fulfilled' && action.meta?.arg.endpointName === 'getCartItems',
      (state) => {
        state.items = []
        state.total = 0
      }
    )
  },
})

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
