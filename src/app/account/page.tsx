'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import Layout from '@/components/layout/Layout'
import { updateUser } from '@/lib/features/auth/authSlice'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/providers/ToastProvider'

export default function AccountPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user, isAuthenticated } = useAppSelector((s) => s.auth)
  const { addToast } = useToast()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    if (user) {
      setFirstName(user.first_name || '')
      setLastName(user.last_name || '')
      setEmail(user.email || '')
    }
  }, [isAuthenticated, router, user])

  if (!isAuthenticated) return null

  const onSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const updated = { ...user, first_name: firstName, last_name: lastName, email }
    dispatch(updateUser(updated))
    addToast({ variant: 'success', title: 'Profile updated', message: 'Your changes have been saved.' })
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Account</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="bg-card border rounded-lg p-4 md:col-span-1">
            <nav className="space-y-1">
              <Link href="/account" className="block px-3 py-2 rounded-md bg-accent text-accent-foreground">Profile</Link>
              <Link href="/account/address-book" className="block px-3 py-2 rounded-md hover:bg-accent text-muted-foreground">Address Book</Link>
              <Link href="/account/payment-options" className="block px-3 py-2 rounded-md hover:bg-accent text-muted-foreground">Payment Options</Link>
              <Link href="/orders" className="block px-3 py-2 rounded-md hover:bg-accent text-muted-foreground">My Orders</Link>
              <Link href="/account/returns" className="block px-3 py-2 rounded-md hover:bg-accent text-muted-foreground">Returns</Link>
              <Link href="/account/wishlist" className="block px-3 py-2 rounded-md hover:bg-accent text-muted-foreground">Wishlist</Link>
            </nav>
          </aside>

          {/* Main content */}
          <section className="bg-card border rounded-lg p-6 md:col-span-3">
            <h2 className="text-xl font-semibold text-foreground mb-4">Edit Your Profile</h2>
            <form onSubmit={onSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">First name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 form-input-base form-input-placeholder form-input-focus"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Last name</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 form-input-base form-input-placeholder form-input-focus"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 form-input-base form-input-placeholder form-input-focus"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  )
}
