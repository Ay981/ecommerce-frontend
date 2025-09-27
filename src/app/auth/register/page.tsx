'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch } from '@/lib/hooks'
import { useRegisterMutation } from '@/lib/api'
import { setCredentials } from '@/lib/features/auth/authSlice'
import Layout from '@/components/layout/Layout'
import { AuthIllustration } from '@/components/auth/AuthIllustration'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/providers/ToastProvider'
import { normalizeAuthError, renderFieldErrors } from '@/lib/errors'

export default function RegisterPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [registerMutation, { isLoading }] = useRegisterMutation()
  const { addToast } = useToast()
  
  const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    username: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Array<{fieldLabel:string; message:string}>>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  setError('')
  setFieldErrors([])

    try {
      const result = await registerMutation(formData).unwrap()
      if (result.access_token) {
        // Mock path gives token immediately
        dispatch(setCredentials({ user: result.user, token: result.access_token }))
        addToast({ variant: 'success', title: 'Account created', message: 'Welcome! You are now signed in.' })
        router.push('/')
      } else {
        // Real backend: redirect to login
        addToast({ variant: 'success', title: 'Account created', message: 'Please log in with your new credentials.' })
        router.push('/auth/login')
      }
    } catch (err) {
      const norm = normalizeAuthError(err)
      if (norm.global) setError(norm.global)
      if (norm.fieldErrors) setFieldErrors(renderFieldErrors(norm.fieldErrors))
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
            <AuthIllustration />
          </div>

          {/* Right Form */}
          <div className="max-w-md w-full mx-auto">
            <h1 className="text-3xl font-bold mb-6 inline-block pb-2 border-b border-border">Create account</h1>
            <p className="text-sm text-muted-foreground mb-8">Enter your details below</p>

            {(error || fieldErrors.length > 0) && (
              <div className="mb-6 space-y-2">
                {error && (
                  <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
                    {error}
                  </div>
                )}
                {fieldErrors.length > 0 && (
                  <ul className="rounded-md border border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/40 divide-y">
                    {fieldErrors.map(fe => (
                      <li key={fe.fieldLabel} className="px-4 py-2 text-xs text-red-700 dark:text-red-300">
                        <span className="font-medium">{fe.fieldLabel}:</span> {fe.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="mb-1 block text-sm font-medium">First Name</label>
                  <input id="first_name" name="first_name" type="text" required value={formData.first_name} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-sm shadow-sm form-input-base form-input-placeholder form-input-focus" placeholder="First name" />
                </div>
                <div>
                  <label htmlFor="last_name" className="mb-1 block text-sm font-medium">Last Name</label>
                  <input id="last_name" name="last_name" type="text" required value={formData.last_name} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-sm shadow-sm form-input-base form-input-placeholder form-input-focus" placeholder="Last name" />
                </div>
              </div>

              {!USE_MOCKS && (
                <div>
                  <label htmlFor="username" className="mb-1 block text-sm font-medium">Username (optional)</label>
                  <input id="username" name="username" type="text" value={formData.username} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-sm shadow-sm form-input-base form-input-placeholder form-input-focus" placeholder="Will default to email prefix if empty" />
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 text-sm shadow-sm form-input-base form-input-placeholder form-input-focus" placeholder="example@email.com" />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
                <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 text-sm shadow-sm form-input-base form-input-placeholder form-input-focus" placeholder="••••••••" />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                variant="outline"
                className="w-full border-2 border-primary/70 text-primary font-semibold tracking-wide hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 focus-visible:ring-primary"
              >
                {isLoading ? 'Creating account…' : 'Create Account'}
              </Button>

              <Button type="button" variant="outline" className="w-full">
                <span className="mr-2 grid h-5 w-5 place-items-center rounded bg-white text-gray-900 text-xs">G</span>
                Sign up with Google
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-red-600 hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
