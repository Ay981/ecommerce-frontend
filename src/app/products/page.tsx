'use client'

import { useEffect, useState, Suspense, useMemo } from 'react'
import Link from 'next/link'
import { useGetProductsQuery, useGetCategoriesQuery, type Product } from '@/lib/api'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { addItem } from '@/lib/features/cart/cartSlice'
import Layout from '@/components/layout/Layout'
import { useToast } from '@/components/providers/ToastProvider'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCreateCartItemMutation } from '@/lib/api'

function ProductsPageInner() {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector(s => s.auth)
  const [addToCart] = useCreateCartItemMutation()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const { addToast } = useToast()
  
  const [page, setPage] = useState(1)
  const pageSize = 12
  const { data: productResp, isLoading: productsLoading, error: productsError, isFetching } = useGetProductsQuery({
    categoryId: selectedCategory || undefined,
    search: searchTerm || undefined,
    page,
    pageSize,
  })
  
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery()

  // Sync searchTerm with URL ?search=
  useEffect(() => {
    const s = searchParams.get('search') || ''
    setSearchTerm(s)
  }, [searchParams])

  const handleAddToCart = async (product: Product) => {
    if (isAuthenticated) {
      try {
        await addToCart({ product_id: product.id, quantity: 1 }).unwrap()
        addToast({ title: 'Added to cart', message: `${product.name} added to cart.` })
      } catch (err) {
        console.error('Add to Cart error:', err)
        // Extract relevant fields and prefer HTML <h1> error, include parse error info
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = err as any
        const status = e.status ?? 'Error'
        const orig = e.originalStatus ? `/${e.originalStatus}` : ''
        let errorText = 'Unknown error'
        if (typeof e.data === 'string') {
          const match = e.data.match(/<h1>([^<]+)<\/h1>/)
          if (match) {
            // Use server HTML error title, append parse error
            const parseErr = e.error ?? ''
            errorText = parseErr ? `${match[1]} (${parseErr})` : match[1]
          } else if (e.error) {
            errorText = e.error
          } else {
            errorText = e.data.trim()
          }
        } else if (e.error) {
          errorText = e.error
        }
        const toastMsg = `${status}${orig}: ${errorText}`
        addToast({
          variant: 'error',
          title: 'Add to Cart Failed',
          message: `Could not add "${product.name}" to cart - ${toastMsg}`,
        })
      }
    } else {
      dispatch(addItem({ product, quantity: 1 }))
      addToast({ title: 'Added to cart', message: `${product.name} added to cart.` })
    }
  }

  const products: Product[] = useMemo(() => Array.isArray(productResp) ? productResp as unknown as Product[] : (productResp?.results ?? []), [productResp])

  if (productsError) {
    // Try to auto-correct invalid page error from DRF
  const errData = (productsError as { data?: unknown })?.data as Record<string, unknown> | undefined
  if (errData && typeof errData.detail === 'string' && errData.detail.toLowerCase().includes('invalid page')) {
      if (page !== 1) setPage(1)
    }
    return (
      <Layout>
        <div className="text-center text-red-600">
          Error loading products. Please try again later.
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Products</h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const s = searchTerm.trim()
                  if (s) router.push(`/products?search=${encodeURIComponent(s)}`)
                  else router.push('/products')
                }}
                className="flex-1"
              >
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 form-input-base form-input-placeholder form-input-focus"
              />
              </form>
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 form-input-base form-input-placeholder form-input-focus"
              >
                <option value="">All Categories</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid / Loading State */}
        <div className="relative">
          {isFetching && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm z-10 hidden md:flex items-center justify-center">
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-sm text-muted-foreground">Updating…</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(productsLoading || categoriesLoading) && products.length === 0 && Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border p-4 space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            {products.map(product => (
              <div key={product.id} className="group bg-card rounded-lg shadow-sm hover:shadow-md transition-all border overflow-hidden">
                <Link href={`/products/${product.id}`}> 
                  <div className="relative h-48 w-full bg-gradient-to-br from-muted to-muted/60 grid place-items-center">
                    <span className="text-muted-foreground text-xs group-hover:scale-105 transition-transform">No Image</span>
                  </div>
                </Link>
                <div className="p-4 flex flex-col gap-3">
                  <Link href={`/products/${product.id}`}> 
                    <h3 className="text-base font-semibold tracking-tight line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-muted-foreground text-xs line-clamp-2 min-h-[32px]">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
                    <span className="text-[11px] text-muted-foreground">Stock: {product.stock_quantity}</span>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock_quantity === 0}
                    className="w-full"
                  >
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

  {(!productsLoading && products.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found.</p>
          </div>
        )}

        {/* Pagination */}
  {(!Array.isArray(productResp)) && productResp && productResp.count > pageSize && products.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(productResp.count / pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(productResp.count / pageSize)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading products...</div>}>
      <ProductsPageInner />
    </Suspense>
  )
}
