'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useGetProductsQuery, useGetCategoriesQuery, type Product } from '@/lib/api'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { addItem } from '@/lib/features/cart/cartSlice'
import Layout from '@/components/layout/Layout'
import { useToast } from '@/components/providers/ToastProvider'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAddToCartMutation } from '@/lib/api'

export default function ProductsPage() {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector(s => s.auth)
  const [addToCart] = useAddToCartMutation()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const { addToast } = useToast()
  
  const [page, setPage] = useState(1)
  const pageSize = 12
  const { data: productResp, isLoading: productsLoading, error: productsError } = useGetProductsQuery({
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
      } catch {
        addToast({ variant: 'error', title: 'Error', message: 'Failed adding to cart' })
      }
    } else {
      dispatch(addItem({ product, quantity: 1 }))
      addToast({ title: 'Added to cart', message: `${product.name} added to cart.` })
    }
  }

  if (productsLoading || categoriesLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  if (productsError) {
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productResp?.results.map((product) => (
            <div key={product.id} className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border">
              <Link href={`/products/${product.id}`}>
                <div className="aspect-w-1 aspect-h-1 bg-muted">
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Stock: {product.stock_quantity}
                  </span>
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

        {productResp && productResp.results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found.</p>
          </div>
        )}

        {/* Pagination */}
        {productResp && productResp.count > pageSize && (
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
