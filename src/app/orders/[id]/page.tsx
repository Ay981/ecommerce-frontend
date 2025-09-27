'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppSelector } from '@/lib/hooks'
import { useGetOrderQuery } from '@/lib/api'
import Layout from '@/components/layout/Layout'

export default function OrderDetailPage() {
  const params = useParams()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const { data: order, isLoading, error } = useGetOrderQuery(params.id as string, {
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

  if (error || !order) {
    return (
      <Layout>
        <div className="text-center text-red-600">
          Order not found or error loading order.
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/orders" className="hover:text-blue-600">Orders</Link>
            <span>/</span>
            <span className="text-foreground">Order #{order.id.slice(-8)}</span>
          </div>
        </nav>

        {/* Order Header */}
  <div className="bg-card border rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Order #{order.id.slice(-8)}
              </h1>
              <p className="text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {order.status === 'pending' && 'Pending'}
                {order.status === 'completed' && 'Completed'}
                {order.status === 'failed' && 'Failed'}
              </span>
              <p className="text-2xl font-bold text-foreground mt-2">
                ${order.total_amount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="bg-card border rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Order Items</h2>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                    <span className="text-muted-foreground text-sm">IMG</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="text-lg font-medium text-foreground hover:text-blue-600"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.product.description}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-semibold text-foreground">
                      ${item.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${(item.price * item.quantity).toFixed(2)} total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-card border rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Shipping Information</h2>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  <span className="font-medium">Address:</span>
                </p>
                <p className="text-foreground whitespace-pre-line">
                  {order.shipping_address}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-card border rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-lg font-semibold text-foreground">${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-card border rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Order Timeline</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Order Placed</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                {order.status === 'pending' && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Pending</p>
                      <p className="text-xs text-muted-foreground">Awaiting fulfillment</p>
                    </div>
                  </div>
                )}
                {order.status === 'completed' && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Completed</p>
                      <p className="text-xs text-muted-foreground">Order fulfilled successfully</p>
                    </div>
                  </div>
                )}
                {order.status === 'failed' && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Failed</p>
                      <p className="text-xs text-muted-foreground">Order was cancelled or failed</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
