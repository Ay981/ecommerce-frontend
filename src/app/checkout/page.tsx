'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useGetCartQuery, useCreateOrderMutation } from '@/lib/api'
import { clearCart } from '@/lib/features/cart/cartSlice'
import Layout from '@/components/layout/Layout'
import { useToast } from '@/components/providers/ToastProvider'

type CheckoutForm = {
  firstName: string
  lastName: string
  company: string
  address: string
  address2: string
  city: string
  phone: string
  email: string
  notes: string
  paymentMethod: 'bank' | 'cod'
  coupon: string
}

type NormalizedItem = {
  key: string
  productId: string | number
  name: string
  price: number
  quantity: number
}

type ServerCartItem = {
  id?: number | string
  quantity?: number
  product_id?: number | string
  product?: {
    id?: number | string
    name?: string
    price?: number | string
  }
  product_price?: number | string
}

const initialForm: CheckoutForm = {
  firstName: '',
  lastName: '',
  company: '',
  address: '',
  address2: '',
  city: '',
  phone: '',
  email: '',
  notes: '',
  paymentMethod: 'bank',
  coupon: '',
}

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export default function CheckoutPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { addToast } = useToast()
  const { items: localItems } = useAppSelector((state) => state.cart)
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  const {
    data: serverCart,
    isLoading: cartLoading,
    isFetching: cartFetching,
  } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  })

  const [createOrder, { isLoading }] = useCreateOrderMutation()
  const [form, setForm] = useState<CheckoutForm>(initialForm)

  const effectiveItems = useMemo<NormalizedItem[]>(() => {
    if (isAuthenticated) {
      const items: ServerCartItem[] = Array.isArray(serverCart?.items)
        ? (serverCart!.items as ServerCartItem[])
        : []
      return items.map((item) => {
        const product = item.product ?? {}
        return {
          key: String(item.id ?? product.id ?? crypto.randomUUID()),
          productId: product.id ?? item.product_id ?? '',
          name: product.name ?? 'Product',
          price: toNumber(product.price ?? item.product_price),
          quantity: item.quantity ?? 0,
        }
      })
    }

    return localItems.map((item) => ({
      key: String(item.product.id),
      productId: item.product.id,
      name: item.product.name,
      price: toNumber(item.product.price),
      quantity: item.quantity,
    }))
  }, [isAuthenticated, serverCart, localItems])

  const subtotal = useMemo(
    () =>
      effectiveItems.reduce((sum, item) => {
        const price = Number(item.price)
        return sum + (Number.isFinite(price) ? price : 0) * item.quantity
      }, 0),
    [effectiveItems],
  )

  const subtotalDisplay =
    isAuthenticated && (cartLoading || cartFetching) ? '—' : `$${subtotal.toFixed(2)}`

  const onChange =
    (field: keyof CheckoutForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const rawValue =
        field === 'paymentMethod'
          ? (event.target as HTMLInputElement).value
          : event.target.value

      const nextValue =
        field === 'paymentMethod'
          ? (rawValue as CheckoutForm['paymentMethod'])
          : rawValue

      setForm((prev) => ({ ...prev, [field]: nextValue }))
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!effectiveItems.length) {
      addToast({
        variant: 'error',
        title: 'Cart empty',
        message: 'Add items before checking out.',
      })
      return
    }

    try {
      const order = await createOrder().unwrap()

      if (!isAuthenticated) dispatch(clearCart())

      addToast({
        variant: 'success',
        title: 'Order placed',
        message: 'Thank you for your purchase!',
      })
      router.push(`/orders/${order.id ?? ''}`)
    } catch (error) {
      console.error(error)
      addToast({
        variant: 'error',
        title: 'Checkout failed',
        message: 'Please verify your details and try again.',
      })
    }
  }

  const isSummaryLoading = isAuthenticated && (cartLoading || cartFetching)

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-semibold text-white">Checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground">Complete your order</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr,1fr]">
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-lg font-medium text-white">Billing Details</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">First Name*</span>
                <input
                  required
                  value={form.firstName}
                  onChange={onChange('firstName')}
                  className="rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-primary"
                  placeholder="Your first name"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">Last Name*</span>
                <input
                  required
                  value={form.lastName}
                  onChange={onChange('lastName')}
                  className="rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-primary"
                  placeholder="Your last name"
                />
              </label>
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm text-muted-foreground">Company Name</span>
                <input
                  value={form.company}
                  onChange={onChange('company')}
                  className="rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-primary"
                  placeholder="Optional"
                />
              </label>
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm text-muted-foreground">Street Address*</span>
                <input
                  required
                  value={form.address}
                  onChange={onChange('address')}
                  className="rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-primary"
                  placeholder="House number and street name"
                />
              </label>
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm text-muted-foreground">Apartment, suite, etc.</span>
                <input
                  value={form.address2}
                  onChange={onChange('address2')}
                  className="rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-primary"
                  placeholder="Optional"
                />
              </label>
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm text-muted-foreground">Town / City*</span>
                <input
                  required
                  value={form.city}
                  onChange={onChange('city')}
                  className="rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-primary"
                  placeholder="City"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">Phone*</span>
                <input
                  required
                  value={form.phone}
                  onChange={onChange('phone')}
                  className="rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-primary"
                  placeholder="+1 555 000 0000"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">Email Address*</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={onChange('email')}
                  className="rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-primary"
                  placeholder="you@example.com"
                />
              </label>
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm text-muted-foreground">Order Notes</span>
                <textarea
                  value={form.notes}
                  onChange={onChange('notes')}
                  rows={3}
                  className="rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-primary"
                  placeholder="Add any special instructions"
                />
              </label>
            </div>
          </form>
          <aside className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-medium text-white">Order Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="space-y-3">
                {isSummaryLoading && <p className="text-sm text-muted-foreground">Loading cart…</p>}
                {!isSummaryLoading && !effectiveItems.length && (
                  <p className="text-sm text-muted-foreground">No items in your cart.</p>
                )}
                {!isSummaryLoading &&
                  effectiveItems.map((item) => (
                    <div key={item.key} className="flex items-start justify-between text-sm">
                      <div>
                        <p className="text-white">{item.name}</p>
                        <p className="text-muted-foreground">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-white">{subtotalDisplay}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span className="font-medium text-white">Free</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-base font-semibold text-white">
                <span>Total</span>
                <span>
                  {isSummaryLoading ? '—' : `$${subtotal.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-white">Payment Method</p>
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment-method"
                      value="bank"
                      checked={form.paymentMethod === 'bank'}
                      onChange={onChange('paymentMethod')}
                    />
                    Bank transfer
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment-method"
                      value="cod"
                      checked={form.paymentMethod === 'cod'}
                      onChange={onChange('paymentMethod')}
                    />
                    Cash on delivery
                  </label>
                </div>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">Coupon Code</span>
                <input
                  value={form.coupon}
                  onChange={onChange('coupon')}
                  className="rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-primary"
                  placeholder="Enter coupon"
                />
              </label>

              <button
                type="submit"
                form="checkout-form"
                disabled={isLoading || isSummaryLoading || !effectiveItems.length}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Placing order…' : 'Place Order'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  )
}
