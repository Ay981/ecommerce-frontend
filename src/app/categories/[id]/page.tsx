'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useGetCategoryQuery, useGetProductsQuery, type Product } from '@/lib/api'
import { useAppDispatch } from '@/lib/hooks'
import { addItem } from '@/lib/features/cart/cartSlice'
import Layout from '@/components/layout/Layout'

export default function CategoryDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: category, isLoading: categoryLoading } = useGetCategoryQuery(params.id as string)
  // Sync with URL
  useEffect(() => {
    const s = searchParams.get('search') || ''
    setSearchTerm(s)
  }, [searchParams])
  const { data: products, isLoading: productsLoading, error } = useGetProductsQuery({
    categoryId: params.id as string,
    search: searchTerm || undefined,
  })

  const handleAddToCart = (product: Product) => {
    dispatch(addItem({ product, quantity: 1 }))
  }

  if (categoryLoading || productsLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (error || !category) {
    return (
      <Layout>
        <div className="text-center text-red-600">
          Category not found or error loading category.
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-blue-600">Categories</Link>
            <span>/</span>
            <span className="text-foreground">{category.name}</span>
          </div>
        </nav>

        {/* Category Header */}
    <div className="bg-card border rounded-lg shadow-md p-8 mb-8">
          <div className="text-center">
      <h1 className="text-4xl font-bold text-foreground mb-4">{category.name}</h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {category.description}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const s = searchTerm.trim()
              if (s) router.push(`/categories/${params.id}?search=${encodeURIComponent(s)}`)
              else router.push(`/categories/${params.id}`)
            }}
          >
          <input
            type="text"
            placeholder={`Search in ${category.name}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 form-input-base form-input-placeholder form-input-focus"
          />
          </form>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.map((product) => (
            <div key={product.id} className="bg-card border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/products/${product.id}`}>
                <div className="aspect-w-1 aspect-h-1 bg-muted">
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                </div>
              </Link>
              
              <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-blue-600">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Stock: {product.stock_quantity}
                  </span>
                </div>
                
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock_quantity === 0}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {products?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found in this category.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
