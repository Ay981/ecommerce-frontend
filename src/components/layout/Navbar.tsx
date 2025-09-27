'use client'

import Link from 'next/link'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { logout } from '@/lib/features/auth/authSlice'
import { useLogoutMutation } from '@/lib/api'
import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
// import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { ShoppingCart, User, Menu, X, LogOut, Package, XCircle, Star } from 'lucide-react'
import SearchInput from '@/components/ui/SearchInput'
import { useToast } from '@/components/providers/ToastProvider'
// import { cn } from '@/lib/utils'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { items } = useAppSelector((state) => state.cart)
  const [logoutMutation] = useLogoutMutation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { addToast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
  await logoutMutation().unwrap()
  dispatch(logout())
  addToast({ variant: 'success', title: 'Logged out', message: 'You have been signed out.' })
  window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
      // Still logout locally even if API call fails
  dispatch(logout())
  addToast({ variant: 'info', title: 'Signed out', message: 'Signed out locally.' })
  window.location.href = '/'
    }
  }

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const [accountOpen, setAccountOpen] = useState(false)

  const handleCartClick: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement> = (e) => {
    if (!isAuthenticated) {
      e.preventDefault()
      router.push('/auth/login?next=/cart')
    }
  }
  return (
  <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary/90 flex items-center justify-center ring-1 ring-border shadow-sm">
                <span className="text-primary-foreground font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-foreground">ALX Ecommerce</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {[
                { href: '/products', label: 'Products' },
                { href: '/categories', label: 'Categories' },
              ].map(link => {
                const active = pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative text-sm font-medium transition-colors px-0.5 ${active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'} after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:scale-x-0 after:bg-primary after:transition-transform after:origin-left ${active ? 'after:scale-x-100' : 'hover:after:scale-x-100'}`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Search (desktop) */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault()
                const q = query.trim()
                if (q) router.push(`/products?search=${encodeURIComponent(q)}`)
                else router.push('/products')
              }}
            >
              <SearchInput
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products"
              />
            </form>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Cart (redirects to login if not authenticated) */}
            <Link href="/cart" className="relative" onClick={handleCartClick} aria-label="Cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 dark:hover:bg-primary/20">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Switcher - Temporarily disabled */}
            {/* <LanguageSwitcher /> */}

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative">
                <Button variant="ghost" size="icon" aria-haspopup="menu" aria-expanded={accountOpen} onClick={() => setAccountOpen((v) => !v)} className="hover:bg-primary/10 dark:hover:bg-primary/20">
                  <User className="h-5 w-5" />
                </Button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-md border bg-card text-card-foreground shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b bg-card">
                      <p className="text-sm text-muted-foreground">Welcome</p>
                      <p className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/account" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent" onClick={() => setAccountOpen(false)}>
                        <User className="h-4 w-4" />
                        Manage My Account
                      </Link>
                      <Link href="/orders" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent" onClick={() => setAccountOpen(false)}>
                        <Package className="h-4 w-4" />
                        My Order
                      </Link>
                      <Link href="/account/cancellations" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent" onClick={() => setAccountOpen(false)}>
                        <XCircle className="h-4 w-4" />
                        My Cancellations
                      </Link>
                      <Link href="/account/reviews" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent" onClick={() => setAccountOpen(false)}>
                        <Star className="h-4 w-4" />
                        My Reviews
                      </Link>
                      <button
                        onClick={() => {
                          setAccountOpen(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-accent"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="font-semibold hover:text-primary">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="font-semibold">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-primary/10 dark:hover:bg-primary/20"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/products"
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/cart"
                className="flex items-center px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  handleCartClick(e)
                  setIsMenuOpen(false)
                }}
              >
                Cart
                {cartItemCount > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/account"
                    className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Account
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <div className="px-3 py-2 border-t">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {user?.first_name}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    variant="destructive"
                    className="w-full justify-start mx-3"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block mx-3 my-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button className="w-full">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
