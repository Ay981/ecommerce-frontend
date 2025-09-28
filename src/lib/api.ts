import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { FetchArgs } from '@reduxjs/toolkit/query'
import type { RootState } from './store'
import {
  mockCategories,
  mockProducts,
  mockUser,
  mockOrders,
} from './mockData'

// Backend currently returns only { email, username } on register and decodes user_id from JWT on login.
// Make non‑returned profile fields optional so UI isn’t forced to fabricate empty strings.
export interface User {
  id: string
  email: string
  username?: string
  first_name?: string
  last_name?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  // Mock mode extra profile fields (ignored by backend)
  first_name?: string
  last_name?: string
  // Backend requirement (username) – optional for caller; will be derived from email prefix if absent
  username?: string
}

// Auth response (mock shape). When integrating real backend (SimpleJWT), you'll map {access, refresh} to this in the component layer.
export interface AuthResponse {
  access_token: string
  token_type: string
  user?: User // optional for future real backend profile fetch
  refresh_token?: string
}

export interface Category {
  // OpenAPI: id (int), name, slug, description. Mock layer previously added timestamps.
  id: string
  name: string
  slug?: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  // Frontend canonical field; when using backend we map backend 'stock' -> stock_quantity
  stock_quantity: number
  // Canonical foreign key id (mock). Backend presently returns category name / nested; mapping step can fill id if available later.
  category_id: string
  category?: Category | { id?: string; name?: string; slug?: string }
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
  // Backend enum (spec): pending | completed (optionally failed). Keep 'failed' for robustness.
  status: 'pending' | 'completed' | 'failed'
  // Frontend canonical total; backend field is total_price (translate when wiring real endpoint)
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
// IMPORTANT: Provide NEXT_PUBLIC_API_BASE_URL in your .env.* (see .env.example).
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'
// No fallback: require NEXT_PUBLIC_API_BASE_URL to be set
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '')
// Enable internal Next.js proxy in dev or when explicitly set
const USE_API_PROXY = process.env.NEXT_PUBLIC_USE_API_PROXY === 'true' || process.env.NODE_ENV === 'development'
const LOG_API = process.env.NEXT_PUBLIC_LOG_API === 'true'

if (LOG_API) console.info('[API CONFIG]', { USE_MOCKS, API_BASE_URL, USE_API_PROXY })

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
  const urlCanonical = urlNoTrailQ.replace(/\/+$/, '')

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
        if (urlCanonical === '/auth/login' && method === 'POST') {
          return { data: { access_token: 'mocktoken', token_type: 'bearer', user: mockUser } }
        }
        if (urlCanonical === '/auth/register' && method === 'POST') {
          return { data: { access_token: 'mocktoken', token_type: 'bearer', user: mockUser } }
        }
        if (urlCanonical === '/auth/token/refresh' && method === 'POST') {
          return { data: { access_token: 'mocktoken-refreshed', token_type: 'bearer' } }
        }
        if (urlCanonical === '/users/me') {
          return { data: mockUser }
        }
        if (urlCanonical === '/users/me' && (method === 'PUT' || method === 'PATCH')) {
          return { data: mockUser }
        }
        if (urlCanonical === '/auth/logout' && method === 'POST') {
          return { data: undefined }
        }
        // Categories
        if (urlCanonical === '/categories') {
          return { data: mockCategories }
        }
        if (urlCanonical.startsWith('/categories/')) {
          const id = urlCanonical.split('/').pop()
            const cat = mockCategories.find((c) => c.id === id)
            if (!cat) return { error: { status: 404, data: 'Category not found' } }
            return { data: cat }
        }
        // Products
        if (urlCanonical.startsWith('/products')) {
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
          const id = urlCanonical.split('/').pop()
          const prod = mockProducts.find((p) => p.id === id)
          if (!prod) return { error: { status: 404, data: 'Product not found' } }
          return { data: prod }
        }
        // Orders (mock, in‑memory persistence)
        // @ts-expect-error initialize global mock orders store if missing
        globalThis.__mockOrders = globalThis.__mockOrders || [...mockOrders]
        // @ts-expect-error read global mock orders
        let mockOrdersStore: Order[] = globalThis.__mockOrders
  if (urlCanonical === '/orders' && method === 'POST') {
          // @ts-expect-error read cart items snapshot before clearing
          const cartItems: ServerCartItem[] = (globalThis.__mockCart.items as ServerCartItem[]).map(it => ({ ...it, product: { ...it.product } }))
          const orderId = 'order_' + Math.random().toString(36).slice(2)
          const orderItems = cartItems.map(ci => ({
            id: 'oi_' + Math.random().toString(36).slice(2),
            order_id: orderId,
            product_id: ci.product_id,
            quantity: ci.quantity,
            price: ci.product.price,
            product: ci.product,
          }))
          const total = orderItems.reduce((s, it) => s + it.price * it.quantity, 0)
          const now = new Date().toISOString()
          const newOrder: Order = {
            id: orderId,
            user_id: 'user_mock',
            status: 'pending',
            total_amount: total,
            shipping_address: 'Mock Address\nPhone: 000\nEmail: mock@example.com',
            created_at: now,
            updated_at: now,
            items: orderItems,
          }
          mockOrdersStore = [newOrder, ...mockOrdersStore]
          // @ts-expect-error write updated orders store
          globalThis.__mockOrders = mockOrdersStore
          // Clear cart
          // @ts-expect-error mutate mock cart clearing after snapshot
          globalThis.__mockCart.items = []
          return { data: newOrder }
        }
        if (urlCanonical === '/orders') {
          return { data: mockOrdersStore }
        }
        if (urlCanonical.startsWith('/orders/')) {
          const id = urlCanonical.split('/').pop()
          const ord = mockOrdersStore.find((o) => o.id === id)
          if (!ord) return { error: { status: 404, data: 'Order not found' } }
          return { data: ord }
        }

        // Cart endpoints (mock)
  if (urlCanonical === '/cart' && method === 'GET') {
          return { data: mockCart }
        }
  if (urlCanonical === '/cart/add' && method === 'POST') {
          // parse body
          // For simplicity, support args as object only
          if (typeof args === 'object' && args.body) {
            const body = args.body as { product_id: string; quantity?: number }
            const prod = mockProducts.find((p) => p.id === body.product_id)
            if (!prod) return { error: { status: 400, data: 'Product not found' } }
            // @ts-expect-error reading custom global mock cart items
            let items: ServerCartItem[] = globalThis.__mockCart.items
            // If items array was frozen by RTK dev checks, clone it before mutating
            if (Object.isFrozen(items)) {
              items = [...items]
            }
            const addQty = body.quantity ?? 1
            const existingIndex = items.findIndex((it) => it.product_id === body.product_id)
            if (existingIndex >= 0) {
              // Build new array with updated quantity (avoid mutating possibly frozen object)
              items = items.map((it, i) => i === existingIndex ? { ...it, quantity: it.quantity + addQty } : it)
            } else {
              const newItem: ServerCartItem = {
                id: 'ci_' + Math.random().toString(36).slice(2),
                product_id: prod.id,
                quantity: addQty,
                product: prod,
              }
              items = [...items, newItem]
            }
            // write back new array
            // @ts-expect-error - write items to mock cart
            globalThis.__mockCart.items = items
            const updatedCart: CartResponse = {
              // @ts-expect-error accessing custom global mock cart id
              id: globalThis.__mockCart.id,
              // @ts-expect-error accessing custom global mock cart items
              items: globalThis.__mockCart.items,
              // @ts-expect-error computing total from custom global mock cart items
              total_amount: (globalThis.__mockCart.items as ServerCartItem[]).reduce((sum, it) => sum + it.product.price * it.quantity, 0),
            }
            return { data: updatedCart }
          }
        }
        if (urlCanonical.startsWith('/cart/item/') && method === 'PUT') {
          const itemId = urlCanonical.split('/').pop()!
          if (typeof args === 'object' && args.body) {
            const body = args.body as { quantity: number }
            // @ts-expect-error - read items from mock cart
            let items: ServerCartItem[] = globalThis.__mockCart.items
            if (Object.isFrozen(items)) items = [...items]
            const idx = items.findIndex((it) => it.id === itemId)
            if (idx === -1) return { error: { status: 404, data: 'Item not found' } }
            if (body.quantity <= 0) {
              // remove
              // @ts-expect-error writing filtered items to global mock cart
              globalThis.__mockCart.items = items.filter((it) => it.id !== itemId)
            } else {
              const updated = { ...items[idx], quantity: body.quantity }
              items = items.map((it,i)=> i===idx ? updated : it)
              // @ts-expect-error writing updated items array back to global mock cart
              globalThis.__mockCart.items = items
            }
            const updatedCart: CartResponse = {
              // @ts-expect-error accessing custom global mock cart id
              id: globalThis.__mockCart.id,
              // @ts-expect-error accessing custom global mock cart items
              items: globalThis.__mockCart.items,
              // @ts-expect-error computing total from custom global mock cart items
              total_amount: (globalThis.__mockCart.items as ServerCartItem[]).reduce((sum, it) => sum + it.product.price * it.quantity, 0),
            }
            return { data: updatedCart }
          }
        }
        if (urlCanonical.startsWith('/cart/item/') && method === 'DELETE') {
          const itemId = urlCanonical.split('/').pop()!
          // @ts-expect-error reading current items from global mock cart
          let current: ServerCartItem[] = globalThis.__mockCart.items
          if (Object.isFrozen(current)) current = [...current]
          // @ts-expect-error writing filtered deletion result to global mock cart
          globalThis.__mockCart.items = current.filter((it: ServerCartItem) => it.id !== itemId)
          const updatedCart: CartResponse = {
            // @ts-expect-error accessing custom global mock cart id
            id: globalThis.__mockCart.id,
            // @ts-expect-error accessing custom global mock cart items
            items: globalThis.__mockCart.items,
            // @ts-expect-error computing total from custom global mock cart items
            total_amount: (globalThis.__mockCart.items as ServerCartItem[]).reduce((sum, it) => sum + it.product.price * it.quantity, 0),
          }
          return { data: updatedCart }
        }
        return { error: { status: 404, data: 'Not found (mock)' } }
      }
    : ((() => {
  // Simple exponential backoff retry wrapper around fetchBaseQuery for transient network (FETCH_ERROR) cases
  const rawBase = fetchBaseQuery({
          baseUrl: USE_API_PROXY ? '/api/proxy/api/v1' : `${API_BASE_URL}/api/v1`,
          prepareHeaders: (headers, { getState, endpoint }) => {
          const publicNoAuthEndpoints = ['login','register','refreshToken']
          const publicReadEndpoints = ['getProducts','getProduct','getCategories','getCategory']
          if (endpoint && (publicNoAuthEndpoints.includes(endpoint))) return headers
          const state = (getState() as RootState)
          const token = state.auth.token
          if (!token) return headers
          // Decode JWT exp (best-effort). If invalid or expired, skip.
          try {
            const payloadSeg = token.split('.')[1]
            const json = atob(payloadSeg.replace(/-/g,'+').replace(/_/g,'/'))
            const payload = JSON.parse(json) as { exp?: number }
            if (payload.exp && payload.exp * 1000 < Date.now()) {
              return headers // expired: don't send -> allow anonymous read
            }
          } catch { /* ignore decoding errors */ }
          if (endpoint && publicReadEndpoints.includes(endpoint)) {
            // Allow unauthenticated caching of public data even if logged in
            return headers
          }
          headers.set('authorization', `Bearer ${token}`)
          return headers
          },
        })
        // Return wrapped baseQuery function with logging
  return async (args: string | FetchArgs, apiCtx: Parameters<typeof rawBase>[1], extraOpts: Parameters<typeof rawBase>[2]) => {
          if (LOG_API) {
            const url = typeof args === 'string' ? args : (args as FetchArgs).url
            // Log before request to verify constructed relative URL (full = baseUrl + this path)
            console.debug('[API REQ]', url)
          }
          const maxRetries = 2
          let attempt = 0
          let result = await rawBase(args, apiCtx, extraOpts)
          while (result.error && (result.error as { status?: unknown }).status === 'FETCH_ERROR' && attempt < maxRetries) {
            attempt++
            const delay = 250 * Math.pow(2, attempt - 1) // 250ms, 500ms
            await new Promise(r => setTimeout(r, delay))
            if (LOG_API) {
              const url = typeof args === 'string' ? args : (args as FetchArgs).url
              console.debug(`[API RETRY ${attempt}]`, url)
            }
            result = await rawBase(args, apiCtx, extraOpts)
          }
          // (Removed complex automatic fallback logic for clarity and stability.)
          if (result.error && LOG_API) {
            const url = typeof args === 'string' ? args : (args as FetchArgs).url
            const errObj = result.error as unknown as { status?: unknown; data?: unknown; error?: unknown }
            const status = errObj?.status
            const data = errObj?.data
            const errStr = errObj?.error
            console.groupCollapsed(`%c[API ERROR] ${url}`,'color:#f87171;font-weight:bold;')
            console.log('Status:', status)
            if (data !== undefined) console.log('Data:', data)
            if (errStr) console.log('Error:', errStr)
            console.log('Raw error object:', errObj)
            console.groupEnd()
          }
          return result
        }
      })()),
  tagTypes: ['User', 'Category', 'Product', 'Order', 'Cart'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => {
        const { email, password } = credentials
        const username = email.includes('@') ? email.split('@')[0] : email
        return {
          url: USE_MOCKS ? '/auth/login' : '/auth/login/',
          method: 'POST',
          body: { email, password, username },
        }
      },
      transformResponse: (resp: unknown): AuthResponse => {
        type JwtLogin = { access?: unknown; refresh?: unknown; access_token?: unknown; token_type?: unknown; user?: unknown }
        const r = (resp || {}) as JwtLogin
        if (typeof r.access_token === 'string') return r as unknown as AuthResponse // mock
        if (typeof r.access === 'string' && typeof r.refresh === 'string') {
          // decode user_id if present
          let user: User | undefined
          try {
            const payloadSeg = r.access.split('.')[1]
            const json = atob(payloadSeg.replace(/-/g, '+').replace(/_/g, '/'))
            const payload = JSON.parse(json)
            if (payload.user_id) {
              user = {
                id: String(payload.user_id),
                email: '',
                first_name: '',
                last_name: '',
                is_active: true,
                created_at: '',
                updated_at: '',
              }
            }
          } catch {/* ignore */}
          return { access_token: r.access, refresh_token: r.refresh, token_type: 'bearer', user }
        }
        return { access_token: '', token_type: 'bearer' }
      },
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => {
        if (USE_MOCKS) {
          return {
            url: '/auth/register',
            method: 'POST',
            body: userData,
          }
        }
        // Real backend expects: email, password, username
        const username = userData.username && userData.username.trim().length > 0
          ? userData.username.trim()
          : userData.email.split('@')[0]
        return {
          url: '/auth/register/',
            method: 'POST',
            body: { email: userData.email, password: userData.password, username },
        }
      },
      transformResponse: (resp: unknown): AuthResponse => {
        // Possible shapes:
        // 1. Mock: { access_token, token_type, user }
        // 2. Real register 201: { email, username }
        // 3. Future: may include { id }
        const r = (resp || {}) as { access_token?: unknown; email?: unknown; username?: unknown; id?: unknown }
        if (typeof r.access_token === 'string') return r as unknown as AuthResponse
        if (typeof r.email === 'string') {
          const user: User = {
            id: typeof r.id === 'string' ? r.id : '',
            email: r.email,
            username: typeof r.username === 'string' ? r.username : undefined,
          }
          return { access_token: '', token_type: 'bearer', user }
        }
        return { access_token: '', token_type: 'bearer' }
      },
      invalidatesTags: ['User'],
    }),
    refreshToken: builder.mutation<{ access_token: string; token_type: string; refresh_token?: string }, { refresh: string }>({
      query: (body) => ({
  // Trailing slash required by DRF default router
  url: '/auth/token/refresh/',
        method: 'POST',
        body,
      }),
      transformResponse: (r: unknown) => {
        const obj = (r || {}) as { access_token?: unknown; access?: unknown; refresh?: unknown }
        // Accept either camel or simple names; preserve new refresh token if issued
        if (typeof obj.access_token === 'string') {
          return {
            access_token: obj.access_token,
            token_type: 'bearer',
            refresh_token: typeof obj.refresh === 'string' ? obj.refresh : undefined,
          }
        }
        if (typeof obj.access === 'string') {
          return {
            access_token: obj.access,
            token_type: 'bearer',
            refresh_token: typeof obj.refresh === 'string' ? obj.refresh : undefined,
          }
        }
        return { access_token: '', token_type: 'bearer' }
      },
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => '/users/me/',
      providesTags: ['User'],
    }),
    updateCurrentUser: builder.mutation<User, Partial<User>>({
      query: (patch) => ({
        url: '/users/me/',
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout/',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Categories endpoints
    getCategories: builder.query<Category[], void>({
      query: () => (USE_MOCKS ? '/categories' : '/shop/categories/'),
      transformResponse: (resp: unknown): Category[] => {
        if (Array.isArray(resp)) return resp as Category[]
        if (resp && typeof resp === 'object' && 'results' in resp) {
          const r = resp as { results?: unknown }
          if (Array.isArray(r.results)) return r.results as Category[]
        }
        return []
      },
      providesTags: ['Category'],
    }),
    getCategory: builder.query<Category, string>({
      query: (id) => (USE_MOCKS ? `/categories/${id}` : `/shop/categories/${id}/`),
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // Products endpoints (paginated shape)
  getProducts: builder.query<{ results: Product[]; count: number; page: number; page_size: number }, { categoryId?: string; search?: string; page?: number; pageSize?: number }>({
      query: ({ categoryId, search, page = 1, pageSize = 12 }) => {
        const params = new URLSearchParams()
        const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'
        // OpenAPI spec: /shop/products/ accepts query params: category (slug), page, search
        // We previously sent page_size which backend does not advertise; removing to avoid potential 500s.
        if (categoryId) params.append(useMocks ? 'category_id' : 'category', categoryId)
        if (search) params.append('search', search)
        params.append('page', String(page))
        // Retain pageSize only for mock pagination simulation (do NOT send to real backend)
        if (useMocks) params.append('page_size', String(pageSize))
  return useMocks ? `/products?${params.toString()}` : `/shop/products/?${params.toString()}`
      },
      // Transform backend response to ensure products have stock_quantity
      transformResponse: (response: unknown): { results: Product[]; count: number; page: number; page_size: number } => {
        interface RawProduct {
          id?: unknown; name?: unknown; description?: unknown; price?: unknown;
          stock?: unknown; stock_quantity?: unknown; category_id?: unknown; category?: unknown;
          created_at?: unknown; updated_at?: unknown;
        }
        const normalize = (raw: unknown): Product => {
          const rp = (raw || {}) as RawProduct
          const stockVal = typeof rp.stock_quantity === 'number'
            ? rp.stock_quantity
            : typeof rp.stock === 'number' ? rp.stock : 0
          let category_id = 'unknown'
            if (typeof rp.category_id === 'string' && rp.category_id) category_id = rp.category_id
            else if (typeof rp.category === 'string') category_id = rp.category
            else if (rp.category && typeof rp.category === 'object' && typeof (rp.category as { id?: unknown }).id === 'string') {
              category_id = (rp.category as { id: string }).id
            }
          return {
            id: String(rp.id ?? ''),
            name: String(rp.name ?? ''),
            description: String(rp.description ?? ''),
            price: Number(rp.price ?? 0),
            stock_quantity: stockVal,
            category_id,
            category: rp.category as (Product['category']),
            created_at: String(rp.created_at ?? ''),
            updated_at: String(rp.updated_at ?? ''),
          }
        }
        if (Array.isArray(response)) {
          // Mock mode (non-paginated array) => fabricate pagination meta
          return { results: response.map(normalize), count: response.length, page: 1, page_size: response.length }
        }
        if (response && typeof response === 'object' && 'results' in response) {
          const obj = response as { results?: unknown[]; count?: unknown; page?: unknown; page_size?: unknown }
          if (Array.isArray(obj.results)) {
            const results = obj.results.map(normalize)
            return {
              results,
              count: typeof obj.count === 'number' ? obj.count : results.length,
              // DRF default PageNumberPagination returns 'count', 'next', 'previous', 'results' (no page/page_size); we infer.
              page: typeof obj.page === 'number' ? obj.page : 1,
              page_size: typeof obj.page_size === 'number' ? obj.page_size : results.length,
            }
          }
        }
        return { results: [], count: 0, page: 1, page_size: 0 }
      },
      providesTags: ['Product'],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => (USE_MOCKS ? `/products/${id}` : `/shop/products/${id}/`),
      transformResponse: (raw: unknown): Product => {
        interface RawProduct { id?: unknown; name?: unknown; description?: unknown; price?: unknown; stock?: unknown; stock_quantity?: unknown; category_id?: unknown; category?: unknown; created_at?: unknown; updated_at?: unknown }
        const r = (raw || {}) as RawProduct
        const stockVal = typeof r.stock_quantity === 'number' ? r.stock_quantity : typeof r.stock === 'number' ? r.stock : 0
        let category_id = 'unknown'
        if (typeof r.category_id === 'string' && r.category_id) category_id = r.category_id
        else if (typeof r.category === 'string') category_id = r.category
        else if (r.category && typeof r.category === 'object' && typeof (r.category as { id?: unknown }).id === 'string') {
          category_id = (r.category as { id: string }).id
        }
        return {
          id: String(r.id ?? ''),
          name: String(r.name ?? ''),
          description: String(r.description ?? ''),
            price: Number(r.price ?? 0),
          stock_quantity: stockVal,
          category_id,
          category: r.category as (Product['category']),
          created_at: String(r.created_at ?? ''),
          updated_at: String(r.updated_at ?? ''),
        }
      },
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({
        url: USE_MOCKS ? '/products' : '/shop/products/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, { id: string; data: Partial<Product> }>({
      query: ({ id, data }) => ({
        url: USE_MOCKS ? `/products/${id}` : `/shop/products/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Product', id }, 'Product'],
    }),
    deleteProduct: builder.mutation<{ success: boolean }, { id: string }>({
      query: ({ id }) => ({
        url: USE_MOCKS ? `/products/${id}` : `/shop/products/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    // Orders endpoints (paginated list)
    getOrders: builder.query<{ results: Order[]; count: number }, { page?: number; pageSize?: number } | void>({
      query: ({ page = 1, pageSize = 20 } = {}) =>
        USE_MOCKS
          ? `/orders?page=${page}&page_size=${pageSize}`
          : `/shop/orders/?page=${page}&page_size=${pageSize}`,
      transformResponse: (raw: unknown) => {
        // raw shape: { count, results: RawOrder[] }
        const obj = raw as { count?: unknown; results?: unknown }
        const count = typeof obj.count === 'number' ? obj.count : 0
        const list = Array.isArray(obj.results) ? (obj.results as unknown[]) : []
        // Reuse existing mapping logic for individual orders
        type RawOrderItem = { id?: unknown; order_id?: unknown; product_id?: unknown; quantity?: unknown; price?: unknown; product?: unknown }
        type RawOrder = { id?: unknown; user_id?: unknown; user?: unknown; status?: unknown; total_amount?: unknown; total_price?: unknown; shipping_address?: unknown; created_at?: unknown; updated_at?: unknown; items?: unknown }
        const mapStatus = (s: unknown): Order['status'] => {
          if (s === 'pending' || s === 'completed' || s === 'failed') return s
          if (s === 'success') return 'completed'
          if (s === 'processing') return 'pending'
          if (s === 'shipped' || s === 'delivered') return 'completed'
          if (s === 'cancelled') return 'failed'
          return 'pending'
        }
        const mapOrder = (o: RawOrder): Order => {
          const itemsRaw = Array.isArray(o.items) ? (o.items as RawOrderItem[]) : []
          return {
            id: String(o.id ?? ''),
            user_id: String(o.user_id ?? o.user ?? ''),
            status: mapStatus(o.status),
            total_amount: typeof o.total_amount === 'number' ? o.total_amount : Number(o.total_price ?? 0),
            shipping_address: String(o.shipping_address ?? ''),
            created_at: String(o.created_at ?? ''),
            updated_at: String(o.updated_at ?? ''),
            items: itemsRaw.map(it => ({
              id: String(it.id ?? ''),
              order_id: String(it.order_id ?? o.id ?? ''),
              product_id: String(it.product_id ?? ((it.product as { id?: unknown } | undefined)?.id) ?? ''),
              quantity: Number(it.quantity ?? 0),
              price: Number(it.price ?? 0),
              product: (it.product ?? {}) as Product,
            })),
          }
        }
        return { count, results: list.map(item => mapOrder(item as RawOrder)) }
      },
      providesTags: ['Order'],
    }),
    getOrder: builder.query<Order, string>({
      query: (id) => `/orders/${id}/`,
      transformResponse: (o: unknown): Order => {
        interface RawOrderItem { id?: unknown; order_id?: unknown; product_id?: unknown; quantity?: unknown; price?: unknown; product?: unknown }
        interface RawOrder { id?: unknown; user_id?: unknown; user?: unknown; status?: unknown; total_amount?: unknown; total_price?: unknown; shipping_address?: unknown; created_at?: unknown; updated_at?: unknown; items?: unknown }
        const raw = (Array.isArray(o) ? o[0] : o) as RawOrder
        const status = raw.status
        const itemsRaw = Array.isArray(raw.items) ? (raw.items as RawOrderItem[]) : []
        return {
          id: String(raw.id ?? ''),
          user_id: String(raw.user_id ?? raw.user ?? ''),
          status: (status === 'pending' || status === 'completed' || status === 'failed') ? (status as Order['status']) : status === 'success' ? 'completed' : 'pending',
          total_amount: typeof raw.total_amount === 'number' ? raw.total_amount as number : Number(raw.total_price ?? 0),
          shipping_address: String(raw.shipping_address ?? ''),
          created_at: String(raw.created_at ?? ''),
          updated_at: String(raw.updated_at ?? ''),
          items: itemsRaw.map(it => ({
            id: String(it.id ?? ''),
            order_id: String(it.order_id ?? raw.id ?? ''),
            product_id: String(it.product_id ?? ((it.product as { id?: unknown }|undefined)?.id) ?? ''),
            quantity: Number(it.quantity ?? 0),
            price: Number(it.price ?? 0),
            product: (it.product ?? {}) as Product,
          })),
        }
      },
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (orderData) => ({
        url: '/orders/',
        method: 'POST',
        body: orderData,
      }),
      transformResponse: (o: unknown): Order => {
        interface RawOrderItem { id?: unknown; order_id?: unknown; product_id?: unknown; quantity?: unknown; price?: unknown; product?: unknown }
        interface RawOrder { id?: unknown; user_id?: unknown; user?: unknown; status?: unknown; total_amount?: unknown; total_price?: unknown; shipping_address?: unknown; created_at?: unknown; updated_at?: unknown; items?: unknown }
        const raw = o as RawOrder
        const itemsRaw = Array.isArray(raw.items) ? (raw.items as RawOrderItem[]) : []
        return {
          id: String(raw.id ?? ''),
          user_id: String(raw.user_id ?? raw.user ?? ''),
          status: (raw.status === 'pending' || raw.status === 'completed' || raw.status === 'failed')
            ? (raw.status as Order['status'])
            : raw.status === 'success'
              ? 'completed'
              : 'pending',
          total_amount: typeof raw.total_amount === 'number' ? raw.total_amount as number : Number(raw.total_price ?? 0),
          shipping_address: String(raw.shipping_address ?? ''),
          created_at: String(raw.created_at ?? ''),
          updated_at: String(raw.updated_at ?? ''),
          items: itemsRaw.map(it => ({
            id: String(it.id ?? ''),
            order_id: String(it.order_id ?? raw.id ?? ''),
            product_id: String(it.product_id ?? ((it.product as { id?: unknown }|undefined)?.id) ?? ''),
            quantity: Number(it.quantity ?? 0),
            price: Number(it.price ?? 0),
            product: (it.product ?? {}) as Product,
          })),
        }
      },
      invalidatesTags: ['Order'],
    }),

    // Cart endpoint (single resource) - retrieve current user's cart
    getCart: builder.query<CartResponse, void>({
      query: () => (USE_MOCKS
        ? '/cart'
        : '/shop/cart/'
      ),
      // Map API response { id, cart_items, total_price } to our CartResponse
      transformResponse: (raw: { id: string | number; cart_items: Array<{ id: string | number; product: Product; quantity: number }>; total_price: string | number }): CartResponse => ({
        id: String(raw.id),
        items: raw.cart_items.map(it => ({
          id: String(it.id),
          product_id: String(it.product.id),
          quantity: it.quantity,
          product: it.product,
        })),
        total_amount: Number(raw.total_price),
      }),
      providesTags: ['Cart'],
    }),
    // Cart Items endpoints
  getCartItems: builder.query<{ results: ServerCartItem[]; count: number }, { page?: number; pageSize?: number }>({
      query: ({ page = 1, pageSize = 20 }) => (USE_MOCKS
          ? `/cart-items?page=${page}&page_size=${pageSize}`
        : `/shop/cart-items/?page=${page}&page_size=${pageSize}`
      ),
      transformResponse: (raw: { count: number; results: Array<{ id: string | number; product: Product & { price: string }; quantity: number }> }) => ({
        count: raw.count,
        results: raw.results.map(it => ({
          id: String(it.id),
          product_id: String(it.product.id),
          quantity: it.quantity,
          product: {
            id: String(it.product.id),
            name: it.product.name,
            description: '',
            price: Number(it.product.price),
            stock_quantity: 0,
            category_id: '',
            created_at: '',
            updated_at: '',
          },
        })),
      }),
      providesTags: ['Cart'],
    }),
  getCartItem: builder.query<ServerCartItem, string>({
      query: (id) => (USE_MOCKS ? `/cart-items/${id}` : `/shop/cart-items/${id}/`),
      providesTags: (result, error, id) => [{ type: 'Cart', id }],
    }),
    createCartItem: builder.mutation<ServerCartItem, { product_id: string; quantity: number }>({
      query: ({ product_id, quantity }) => ({
        url: USE_MOCKS ? '/cart-items/' : '/shop/cart-items/',
        method: 'POST',
        // Send `product_id` as number, not string, per DRF expectation
        body: { product_id: Number(product_id), quantity },
      }),
      // Convert returned product.price from string to number
      transformResponse: (raw: { id: string | number; product: { id: string | number; name: string; price: string }; quantity: number }): ServerCartItem => ({
        id: String(raw.id),
        product_id: String(raw.product.id),
        quantity: raw.quantity,
        product: {
          id: String(raw.product.id),
          name: raw.product.name,
          description: '',
          price: Number(raw.product.price),
          stock_quantity: 0,
          category_id: '',
          created_at: '',
          updated_at: '',
        },
      }),
      invalidatesTags: ['Cart'],
    }),
  updateCartItem: builder.mutation<ServerCartItem, { id: string; data: Partial<{ product_id: string; quantity: number }> }>({
      query: ({ id, data }) => ({
        url: USE_MOCKS ? `/cart-items/${id}/` : `/shop/cart-items/${id}/`,
        method: 'PATCH',
        // Ensure product_id is a number if provided
        body: {
          ...(data.quantity !== undefined && { quantity: data.quantity }),
          ...(data.product_id !== undefined && { product_id: Number(data.product_id) }),
        },
      }),
      // Convert returned product.price from string to number
      transformResponse: (raw: { id: string | number; product: { id: string | number; name: string; price: string }; quantity: number }): ServerCartItem => ({
        id: String(raw.id),
        product_id: String(raw.product.id),
        quantity: raw.quantity,
        product: {
          id: String(raw.product.id),
          name: raw.product.name,
          description: '',
          price: Number(raw.product.price),
          stock_quantity: 0,
          category_id: '',
          created_at: '',
          updated_at: '',
        },
      }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Cart', id }],
    }),
    deleteCartItem: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: USE_MOCKS ? `/cart-items/${id}/` : `/shop/cart-items/${id}/`,
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
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useGetCartQuery,
  useGetCartItemsQuery,
  useGetCartItemQuery,
  useCreateCartItemMutation,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
} = api
