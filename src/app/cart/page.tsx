'use client'

import Link from 'next/link'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { removeItem, updateQuantity } from '@/lib/features/cart/cartSlice'
import Layout from '@/components/layout/Layout'

export default function CartPage() {
  const dispatch = useAppDispatch()
  const { items, total } = useAppSelector((state) => state.cart)

  const handleQuantityChange = (productId: string, quantity: number) => {
    dispatch(updateQuantity({ productId, quantity }))
  }

  const handleRemoveItem = (productId: string) => {
    dispatch(removeItem(productId))
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">Looks like you haven&apos;t added any items to your cart yet.</p>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Shopping Cart</h1>
          <p className="text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-lg shadow-md overflow-hidden">
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.product.id} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">No Image</span>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product.id}`}
                          className="text-lg font-medium text-foreground hover:text-blue-600"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {item.product.description}
                        </p>
                        <p className="text-lg font-semibold text-blue-600 mt-2">
                          ${item.product.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-accent"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock_quantity}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-foreground">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="text-red-600 hover:text-red-800 text-sm mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
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
                    <span className="text-lg font-semibold text-foreground">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block font-medium"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="w-full border bg-background text-foreground py-3 px-4 rounded-md hover:bg-accent transition-colors text-center block font-medium mt-3"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
