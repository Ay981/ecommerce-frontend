'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch } from '@/lib/hooks'
import { useLoginMutation } from '@/lib/api'
import { setCredentials } from '@/lib/features/auth/authSlice'
import Layout from '@/components/layout/Layout'
import { useToast } from '@/components/providers/ToastProvider'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [loginMutation, { isLoading }] = useLoginMutation()
  const { addToast } = useToast()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [remember, setRemember] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const result = await loginMutation(formData).unwrap()
      dispatch(setCredentials({ user: result.user, token: result.access_token }))
      addToast({ variant: 'success', title: 'Welcome back', message: 'You are now logged in.' })
      router.push('/')
    } catch (err) {
      const message = (err as { data?: { detail?: string } })?.data?.detail ?? 'Login failed'
      setError(message)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left Illustration */}
          <div className="hidden md:block">
            <div className="rounded-xl bg-gradient-to-b from-sky-100 to-sky-200 dark:from-slate-800 dark:to-slate-900 p-8">
              <div className="aspect-[4/3] rounded-lg bg-white/60 dark:bg-white/5 grid place-items-center">
                <div className="text-7xl">📱</div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="max-w-md w-full mx-auto">
            <h1 className="text-3xl font-bold mb-2">Log in to Exclusive</h1>
            <p className="text-muted-foreground mb-8">Enter your details below</p>

            {error && (
              <div className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">Email or Phone Number</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 text-sm shadow-sm form-input-base form-input-placeholder form-input-focus"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 text-sm shadow-sm form-input-base form-input-placeholder form-input-focus"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-input" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Remember me
                </label>
                <Link href="#" className="text-red-600 hover:underline">Forgot Password?</Link>
              </div>

              <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                {isLoading ? 'Logging in…' : 'Log in'}
              </Button>

              <div className="relative py-2 text-center text-sm text-muted-foreground">
                <span className="bg-background px-2 relative z-10">or</span>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t" />
              </div>

              <Button type="button" variant="outline" className="w-full">
                {/* Simple G badge */}
                <span className="mr-2 grid h-5 w-5 place-items-center rounded bg-white text-gray-900 text-xs">G</span>
                Sign in with Google
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-medium text-red-600 hover:underline">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
