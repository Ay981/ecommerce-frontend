'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { useCreateOrderMutation, useGetCartQuery } from '@/lib/api'
import { clearCart } from '@/lib/features/cart/cartSlice'
import Layout from '@/components/layout/Layout'
import { useToast } from '@/components/providers/ToastProvider'

export default function CheckoutPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { items: localItems, total: localTotal } = useAppSelector((state) => state.cart)
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  // fetch server cart when authenticated
  const { data: serverCart } = useGetCartQuery(undefined, { skip: !isAuthenticated })
  const [createOrderMutation, { isLoading }] = useCreateOrderMutation()
  const { addToast } = useToast()
  
  // form fields type
  interface FormData {
    firstName: string
    companyName: string
    streetAddress: string
    // fetch server cart when authenticated
    const { data: serverCart } = useGetCartQuery(undefined, { skip: !isAuthenticated })
    phone: string
    email: string
      ? serverCart?.items.map(it => ({ product: it.product, quantity: it.quantity })) || []
  }
    const baseTotal = isAuthenticated
      ? serverCart?.items.reduce((sum, it) => sum + it.product.price * it.quantity, 0) || 0
    companyName: '',
    streetAddress: '',
    apartment: '',
    city: '',
    phone: '',
    email: '',
    saveInfo: false,
  })
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cod'>('bank')
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [error, setError] = useState('')


  useEffect(() => {
    if (!isAuthenticated && localItems.length === 0) {
      router.replace('/cart')
    }
  }, [isAuthenticated, localItems.length, router])

  const effectiveItems = isAuthenticated
    ? serverCart?.items.map(it => ({ product: it.product, quantity: it.quantity })) || []
    : localItems
  const baseTotal = isAuthenticated
    ? serverCart?.total_amount || 0
    : localTotal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic required validation
    if (!formData.firstName || !formData.streetAddress || !formData.city || !formData.phone || !formData.email) {
      setError('Please fill in all required fields marked with *')
      return
    }

    try {
      const shipping_address = [
        `${formData.firstName}${formData.companyName ? `, ${formData.companyName}` : ''}`,
        formData.streetAddress,
        formData.apartment ? formData.apartment : undefined,
        formData.city,
        `Phone: ${formData.phone}`,
        `Email: ${formData.email}`,
      ].filter(Boolean).join('\n')

      const orderData = isAuthenticated
        ? {
            shipping_address,
            // Send server cart items
            items: serverCart?.items.map(it => ({ product_id: it.product.id, quantity: it.quantity })) || [],
            payment_method: paymentMethod,
            coupon_code: couponApplied ? couponCode : undefined,
          }
        : {
            shipping_address,
            items: localItems.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
            payment_method: paymentMethod,
            coupon_code: couponApplied ? couponCode : undefined,
          }

      const order = await createOrderMutation(orderData).unwrap()
      if (!isAuthenticated) {
        dispatch(clearCart())
      }
      addToast({ message: 'Order placed successfully', variant: 'success' })
      router.push(`/orders/${order.id}`)
    } catch (err) {
      const message = (err as { data?: { detail?: string } })?.data?.detail ?? 'Failed to create order'
      setError(message)
      addToast({ message: message, variant: 'error' })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData((p) => ({ ...p, [name]: value }))
  }

  const discountAmount = !couponApplied ? 0 : parseFloat((baseTotal * 0.1).toFixed(2))
  const grandTotal = Math.max(baseTotal - discountAmount, 0)

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) return
    if (code === 'SAVE10') {
      setCouponApplied(true)
      addToast({ message: 'Coupon applied: 10% off', variant: 'success' })
    } else {
      setCouponApplied(false)
      addToast({ message: 'Invalid coupon code', variant: 'error' })
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

            {error && (
              <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-950/60 dark:text-red-100">
                {error}
              </div>
            )}

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
              {effectiveItems.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">IMG</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.product.name}</div>
                    <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                  </div>
                    <div className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">${baseTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-medium">Free</span></div>
              {couponApplied && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400"><span>Coupon (SAVE10)</span><span>- ${discountAmount.toFixed(2)}</span></div>
              )}
              <div className="border-t pt-3 flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
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
                    checked={paymentMethod === 'bank'}
                    onChange={() => setPaymentMethod('bank')}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Bank
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Cash on delivery
                </label>
              </div>
            </div>

            {/* Coupon */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 form-input-base form-input-placeholder form-input-focus"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
              >
                Apply Coupon
              </button>
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
