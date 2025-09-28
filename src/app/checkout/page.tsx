'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { useGetCartQuery, useCreateOrderMutation } from '@/lib/api'
import { clearCart } from '@/lib/features/cart/cartSlice'
import Layout from '@/components/layout/Layout'
import { useToast } from '@/components/providers/ToastProvider'

export default function CheckoutPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { items: localItems, total: localTotal } = useAppSelector(state => state.cart)
  const { isAuthenticated } = useAppSelector(state => state.auth)
  const { data: serverCart, isLoading: isCartLoading } = useGetCartQuery(undefined, { skip: !isAuthenticated, refetchOnMountOrArgChange: true })
  const [createOrder, { isLoading }] = useCreateOrderMutation()
  const { addToast } = useToast()

  // Determine which items and total to display
  const effectiveItems = isAuthenticated && serverCart
    ? serverCart.items.map(item => ({ product: item.product, quantity: item.quantity }))
    : localItems
  const baseTotal = isAuthenticated
    ? (serverCart ? serverCart.total_amount : 0)
    : localTotal

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    companyName: '',
    streetAddress: '',
    apartment: '',
    city: '',
    phone: '',
    email: '',
    saveInfo: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    const { firstName, streetAddress, city, phone, email } = formData
    if (!firstName || !streetAddress || !city || !phone || !email) {
      addToast({ variant: 'error', message: 'Please fill in all required fields.' })
      return
    }
    // Build items payload
    const itemsPayload = effectiveItems.map(it => ({ product_id: it.product.id, quantity: it.quantity }))
    try {
      await createOrder({
        shipping_address: [
          firstName + (formData.companyName ? `, ${formData.companyName}` : ''),
          streetAddress,
          formData.apartment || undefined,
          city,
          `Phone: ${phone}`,
          `Email: ${email}`,
        ].filter(Boolean).join('\n'),
        items: itemsPayload,
        payment_method: 'bank',
        coupon_code: undefined,
      }).unwrap()
      if (!isAuthenticated) dispatch(clearCart())
      addToast({ variant: 'success', message: 'Order placed successfully' })
      router.push('/orders') // or `/orders/${order.id}` if returned
    } catch {
      addToast({ variant: 'error', message: 'Failed to place order' })
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 lg:px-0">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
          {/* Billing Details */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-6">Billing Details</h2>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="mb-1 block text-sm">First Name*</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full px-3 py-2 form-input-base form-input-placeholder form-input-focus"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    className="w-full px-3 py-2 form-input-base form-input-placeholder form-input-focus"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Street Address*</label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    placeholder="House number and street name"
                    className="w-full px-3 py-2 form-input-base form-input-placeholder form-input-focus"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Apartment, floor, etc. (optional)</label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, unit"
                    className="w-full px-3 py-2 form-input-base form-input-placeholder form-input-focus"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Town/City*</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full px-3 py-2 form-input-base form-input-placeholder form-input-focus"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Phone Number*</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +1 555 000 1111"
                    className="w-full px-3 py-2 form-input-base form-input-placeholder form-input-focus"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Email Address*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 form-input-base form-input-placeholder form-input-focus"
                  />
                </div>
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="saveInfo"
                    checked={formData.saveInfo}
                    onChange={handleInputChange}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span>Save this information for faster check-out next time</span>
                </label>
              </div>

            </form>
          </div>

          {/* Order Summary */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4 mb-4">
              {effectiveItems.map(item => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                    IMG
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.product.name}</div>
                    <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {isAuthenticated && isCartLoading ? 'Loading...' : `$${baseTotal.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="font-medium">
                  {isAuthenticated && isCartLoading ? 'Loading...' : `$${baseTotal.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Payment methods */}
            <div className="mt-5">
              <div className="mb-2 text-sm font-medium">Payment Method</div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={true}
                    onChange={() => {}}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Bank
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={false}
                    onChange={() => {}}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Cash on delivery
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                form="checkout-form"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Processing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
