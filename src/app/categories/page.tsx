'use client'

import Link from 'next/link'
import { useGetCategoriesQuery } from '@/lib/api'
import Layout from '@/components/layout/Layout'

export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useGetCategoriesQuery()

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-600">
          Error loading categories. Please try again later.
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Categories</h1>
          <p className="text-muted-foreground">Browse products by category</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group border"
            >
              <div className="aspect-w-16 aspect-h-9 bg-muted">
                <div className="w-full h-48 bg-gradient-to-br from-blue-600/10 to-blue-400/10 dark:from-blue-400/10 dark:to-blue-300/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📦</div>
                    <span className="text-muted-foreground font-medium">Category</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {category.description}
                </p>
                <div className="mt-4 text-blue-600 text-sm font-medium group-hover:text-blue-800">
                  View Products →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {categories?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No categories found.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
