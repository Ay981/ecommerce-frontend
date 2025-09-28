'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAppSelector } from '@/lib/hooks'
import { useGetOrdersQuery } from '@/lib/api'
import Layout from '@/components/layout/Layout'
import { useRouter } from 'next/navigation'

export default function OrdersPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const { data: orders, isLoading, error } = useGetOrdersQuery(undefined, {
    skip: !isAuthenticated,
  })

  // Redirect to login if not authenticated
  useEffect(() => {
  if (!isAuthenticated) router.push('/auth/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

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
          Error loading orders. Please try again later.
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">My Orders</h1>
          <p className="text-muted-foreground">View your order history and track your shipments</p>
        </div>

  {orders?.results.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">No orders yet</h2>
            <p className="text-muted-foreground mb-8">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders?.results.map((order) => (
              <div key={order.id} className="bg-card border rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Order #{order.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' && 'Pending'}
                      {order.status === 'completed' && 'Completed'}
                      {order.status === 'failed' && 'Failed'}
                    </span>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      ${order.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Shipping Address:</span> {order.shipping_address}
                  </p>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-foreground mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-muted-foreground text-xs">IMG</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Items:</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
