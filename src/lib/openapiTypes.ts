// OpenAPI schema-derived types for Project Nexus E-Commerce API
// These mirror the backend shapes (prior to any frontend normalization)

// Generic paginated response (DRF PageNumberPagination shape)
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Category (list & detail use same shape in provided schema)
export interface ApiCategory {
  id: number
  name: string
  slug?: string
  description: string
}

// Product list item (simplified category = string per schema ProductList.category)
export interface ApiProductListItem {
  id: number
  name: string
  price: string | number
  stock?: number
  category: string // category name or slug (schema shows string)
}

// Product detail (nested category object)
export interface ApiProductDetailCategory {
  id: number
  name: string
  slug?: string
  description: string
}
export interface ApiProductDetail {
  id: number
  name: string
  description: string
  price: string | number
  stock?: number
  category: ApiProductDetailCategory
}

// Auth / Tokens
export interface CustomTokenObtainPairRequest {
  email: string // or username (backend allows either via custom serializer)
  password: string
}
export interface CustomTokenObtainPairResponse {
  access: string
  refresh: string
}
export interface TokenRefreshRequest {
  refresh: string
}
export interface TokenRefreshResponse {
  access: string
  refresh: string
}

// Registration
export interface RegisterUserRequest {
  email: string
  password: string
  username?: string
}
export interface RegisterUserResponse {
  email: string
  username: string
}

// Frontend canonical normalized shapes (mapping from API types)
export interface NormalizedCategory {
  id: string
  name: string
  slug?: string
  description: string
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  category_id: string
  // Preserve raw category object or string for UI labeling
  category?: ApiProductDetailCategory | string
  created_at?: string
  updated_at?: string
}

// Utility mappers
export function mapApiCategory(c: ApiCategory): NormalizedCategory {
  return { id: String(c.id), name: c.name, slug: c.slug, description: c.description }
}

export function mapApiProductListItem(p: ApiProductListItem): Product {
  return {
    id: String(p.id),
    name: p.name,
    description: '',
    price: typeof p.price === 'string' ? Number(p.price) : p.price,
    stock_quantity: typeof p.stock === 'number' ? p.stock : 0,
    category_id: typeof p.category === 'string' ? p.category : '',
    category: p.category,
  }
}

export function mapApiProductDetail(p: ApiProductDetail): Product {
  return {
    id: String(p.id),
    name: p.name,
    description: p.description,
    price: typeof p.price === 'string' ? Number(p.price) : p.price,
    stock_quantity: typeof p.stock === 'number' ? p.stock : 0,
    category_id: String(p.category?.id ?? ''),
    category: p.category,
  }
}
