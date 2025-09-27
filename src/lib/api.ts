import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { FetchArgs } from '@reduxjs/toolkit/query'
import type { RootState } from './store'
import {
  mockCategories,
  mockProducts,
  mockUser,
  mockOrders,
} from './mockData'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface Category {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  category_id: string
  category?: Category
  created_at: string
  updated_at: string
}

export interface CartItem {
  product_id: string
  quantity: number
  product?: Product
}

export interface ServerCartItem {
  id: string
  product_id: string
  quantity: number
  product: Product
}

export interface CartResponse {
  id: string
  items: ServerCartItem[]
  total_amount: number
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  shipping_address: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product: Product
}

export interface CreateOrderRequest {
  shipping_address: string
  items: Array<{
    product_id: string
    quantity: number
  }>
  payment_method?: 'bank' | 'cod'
  coupon_code?: string
}

// Get API base URL from environment

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: USE_MOCKS
    ? async (args: string | FetchArgs) => {
        // Normalize args from string or object
        let url = ''
        let method: string = 'GET'
        if (typeof args === 'string') {
          url = args
        } else if (args && typeof args === 'object') {
          url = args.url || ''
          method = (args.method || 'GET').toUpperCase()
        }
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 120))
        const urlNoTrailQ = url.replace(/\?$/, '')

        // In-memory mock cart state
        // Note: this resets on reload; suitable for UX/dev only
        // @ts-expect-error - store a simple cart in global for mocks
        globalThis.__mockCart = globalThis.__mockCart || { id: 'cart1', items: [] as ServerCartItem[] }
  const mockCart: CartResponse = {
          // @ts-expect-error - read id from mock cart
          id: globalThis.__mockCart.id,
          // @ts-expect-error - read items from mock cart
          items: globalThis.__mockCart.items,
          total_amount: (
            // @ts-expect-error - items type on mock
            globalThis.__mockCart.items as ServerCartItem[]
          ).reduce((sum, it) => sum + it.product.price * it.quantity, 0),
        }
        // Auth
        if (urlNoTrailQ === '/auth/login' && method === 'POST') {
          return { data: { access_token: 'mocktoken', token_type: 'bearer', user: mockUser } }
        }
        if (urlNoTrailQ === '/auth/register' && method === 'POST') {
          return { data: { access_token: 'mocktoken', token_type: 'bearer', user: mockUser } }
        }
        if (urlNoTrailQ === '/auth/token/refresh' && method === 'POST') {
          return { data: { access_token: 'mocktoken-refreshed', token_type: 'bearer' } }
        }
        if (urlNoTrailQ === '/auth/me') {
          return { data: mockUser }
        }
        if (urlNoTrailQ === '/users/me' && (method === 'PUT' || method === 'PATCH')) {
          return { data: mockUser }
        }
        if (urlNoTrailQ === '/auth/logout' && method === 'POST') {
          return { data: undefined }
        }
        // Categories
        if (urlNoTrailQ === '/categories') {
          return { data: mockCategories }
        }
        if (urlNoTrailQ.startsWith('/categories/')) {
          const id = urlNoTrailQ.split('/').pop()
          return { data: mockCategories.find((c) => c.id === id) }
        }
        // Products
        if (urlNoTrailQ.startsWith('/products')) {
          // parse query params
          let filtered = mockProducts
          if (url.includes('?')) {
            const params = new URLSearchParams(url.split('?')[1] || '')
            const cat = params.get('category_id')
            const search = params.get('search')
            if (cat) filtered = filtered.filter((p) => p.category_id === cat)
            if (search) filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
          }
          if (/^\/products(\/?|\?.*)?$/.test(url)) return { data: filtered }
          const id = urlNoTrailQ.split('/').pop()
          return { data: mockProducts.find((p) => p.id === id) }
        }
        // Orders
        if (urlNoTrailQ === '/orders' && method === 'POST') {
          // Clear mock cart on order
          // @ts-expect-error - mutate global mock cart
          globalThis.__mockCart.items = []
          return { data: { ...mockOrders[0], id: 'order' + Math.random().toString(36).slice(2) } }
        }
        if (urlNoTrailQ === '/orders') {
          return { data: mockOrders }
        }
        if (urlNoTrailQ.startsWith('/orders/')) {
          const id = urlNoTrailQ.split('/').pop()
          return { data: mockOrders.find((o) => o.id === id) }
        }

        // Cart endpoints (mock)
        if (urlNoTrailQ === '/cart' && method === 'GET') {
          return { data: mockCart }
        }
        if (urlNoTrailQ === '/cart/add' && method === 'POST') {
          // parse body
          // For simplicity, support args as object only
          if (typeof args === 'object' && args.body) {
            const body = args.body as { product_id: string; quantity?: number }
            const prod = mockProducts.find((p) => p.id === body.product_id)
            if (!prod) return { error: { status: 400, data: 'Product not found' } }
            // @ts-expect-error - read items from mock cart
            const items: ServerCartItem[] = globalThis.__mockCart.items
            let item = items.find((it) => it.product_id === body.product_id)
            if (item) {
              item.quantity += body.quantity ?? 1
            } else {
              item = {
                id: 'ci_' + Math.random().toString(36).slice(2),
                product_id: prod.id,
                quantity: body.quantity ?? 1,
                product: prod,
              }
              items.push(item)
            }
            return { data: mockCart }
          }
        }
        if (urlNoTrailQ.startsWith('/cart/item/') && method === 'PUT') {
          const itemId = urlNoTrailQ.split('/').pop()!
          if (typeof args === 'object' && args.body) {
            const body = args.body as { quantity: number }
            // @ts-expect-error - read items from mock cart
            const items: ServerCartItem[] = globalThis.__mockCart.items
            const item = items.find((it) => it.id === itemId)
            if (!item) return { error: { status: 404, data: 'Item not found' } }
            if (body.quantity <= 0) {
              // remove
              // @ts-expect-error - write items to mock cart
              globalThis.__mockCart.items = items.filter((it) => it.id !== itemId)
            } else {
              item.quantity = body.quantity
            }
            return { data: mockCart }
          }
        }
        if (urlNoTrailQ.startsWith('/cart/item/') && method === 'DELETE') {
          const itemId = urlNoTrailQ.split('/').pop()!
          // @ts-expect-error - write items to mock cart
          globalThis.__mockCart.items = globalThis.__mockCart.items.filter((it: ServerCartItem) => it.id !== itemId)
          return { data: mockCart }
        }
        return { error: { status: 404, data: 'Not found (mock)' } }
      }
    : fetchBaseQuery({
        baseUrl: `${API_BASE_URL}/api/v1`,
        prepareHeaders: (headers, { getState }) => {
          // Get token from Redux state
          const token = (getState() as RootState).auth.token
          if (token) {
            headers.set('authorization', `Bearer ${token}`)
          }
          return headers
        },
      }),
  tagTypes: ['User', 'Category', 'Product', 'Order', 'Cart'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    refreshToken: builder.mutation<{ access_token: string; token_type: string }, { refresh: string }>({
      query: (body) => ({
        url: '/auth/token/refresh',
        method: 'POST',
        body,
      }),
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    updateCurrentUser: builder.mutation<User, Partial<User>>({
      query: (patch) => ({
        url: '/users/me',
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Categories endpoints
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    getCategory: builder.query<Category, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // Products endpoints (paginated shape)
    getProducts: builder.query<
      { results: Product[]; count: number; page: number; page_size: number },
      { categoryId?: string; search?: string; page?: number; pageSize?: number }
    >({
      query: ({ categoryId, search, page = 1, pageSize = 12 }) => {
        const params = new URLSearchParams()
        if (categoryId) params.append('category_id', categoryId)
        if (search) params.append('search', search)
        params.append('page', String(page))
        params.append('page_size', String(pageSize))
        return `/products?${params.toString()}`
      },
      providesTags: ['Product'],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, { id: string; data: Partial<Product> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Product', id }, 'Product'],
    }),
    deleteProduct: builder.mutation<{ success: boolean }, { id: string }>({
      query: ({ id }) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    // Orders endpoints
    getOrders: builder.query<Order[], void>({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    getOrder: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),

    // Cart endpoints
    getCart: builder.query<CartResponse, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation<CartResponse, { product_id: string; quantity?: number }>({
      query: (body) => ({
        url: '/cart/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation<CartResponse, { item_id: string; quantity: number }>({
      query: ({ item_id, quantity }) => ({
        url: `/cart/item/${item_id}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: builder.mutation<CartResponse, { item_id: string }>({
      query: ({ item_id }) => ({
        url: `/cart/item/${item_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useLogoutMutation,
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} = api
