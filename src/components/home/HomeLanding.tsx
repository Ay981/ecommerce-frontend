'use client'

import Link from 'next/link'
import { useGetProductsQuery, useGetCategoriesQuery, type Product, useAddToCartMutation } from '@/lib/api'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { addItem } from '@/lib/features/cart/cartSlice'
import Layout from '@/components/layout/Layout'
import { ProductCard } from '@/components/ui/ProductCard'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowRight, ShoppingBag, Star, Truck, Shield, Headphones, Sparkles } from 'lucide-react'
import PromoBanners from './PromoBanners'
import BestSellers from './BestSellers'
import FlashSales from './FlashSales'
import CategoryRow from './CategoryRow'
import ExploreGrid, { NewArrival } from './ExploreGrid'
import { useToast } from '@/components/providers/ToastProvider'

export default function HomeLanding() {
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state) => state.cart)
  const { data: featuredProductsResp } = useGetProductsQuery({ page: 1, pageSize: 40 })
  const { data: categories } = useGetCategoriesQuery()
  const { addToast } = useToast()
  const { isAuthenticated } = useAppSelector(s => s.auth)
  const [addToCart] = useAddToCartMutation()

  const handleAddToCart = async (product: Product) => {
    if (isAuthenticated) {
      try {
        await addToCart({ product_id: product.id, quantity: 1 }).unwrap()
        addToast({ title: 'Added to cart', message: `${product.name} was added to your cart.` })
      } catch {
        addToast({ variant: 'error', title: 'Error', message: 'Failed adding to cart' })
      }
    } else {
      dispatch(addItem({ product, quantity: 1 }))
      addToast({ title: 'Added to cart', message: `${product.name} was added to your cart.` })
    }
  }

  const featuredProducts = featuredProductsResp?.results || []
  const featured = featuredProducts.slice(0, 4)
  const featuredCategories = categories?.slice(0, 3) || []

  const features = [
    { icon: Truck, title: 'Fast Delivery', description: 'Free shipping on orders over $50' },
    { icon: Shield, title: 'Secure Payment', description: '100% secure payment processing' },
    { icon: Headphones, title: '24/7 Support', description: 'Round-the-clock customer support' },
    { icon: Star, title: 'Quality Guarantee', description: 'Premium quality products' },
  ]

  return (
  <Layout>
  {/* Flash Sales */}
  {featuredProducts.length > 0 && (
    <FlashSales products={featuredProducts} onAddToCartAction={handleAddToCart} />
  )}
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-4 py-24 lg:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                Welcome to ALX Ecommerce
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Discover Amazing
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Products</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Discover amazing products at unbeatable prices. Shop with confidence and enjoy fast, reliable delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 dark:text-blue-600 dark:hover:bg-white/90">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Shop Now
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 dark:hover:text-blue-600">
                    Browse Categories
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

  <PromoBanners />

  {/* Category Row */}
  {categories && <CategoryRow categories={categories} />}

        {/* Features */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center border-0 shadow-none bg-transparent">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

  <BestSellers onAddToCartAction={handleAddToCart} />

  {/* Mega Banner removed */}

  {/* Explore Grid */}
  {featuredProducts.length > 0 && (
    <ExploreGrid products={featuredProducts} onAddAction={handleAddToCart} />
  )}

  {/* New Arrival */}
  {featuredProducts.length > 0 && <NewArrival products={featuredProducts} />}

        {/* Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Find exactly what you&apos;re looking for</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {featuredCategories.map((category) => (
                <Link key={category.id} href={`/categories/${category.id}`}>
                  <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <CardHeader className="p-0">
                      <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-primary" />
                          </div>
                          <span className="text-muted-foreground font-medium">Category</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                      <p className="text-muted-foreground line-clamp-3">{category.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Link href="/categories">
                <Button size="lg" variant="outline">
                  View All Categories
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Handpicked items just for you</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
            <div className="text-center">
              <Link href="/products">
                <Button size="lg" variant="outline">
                  View All Products
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Cart Summary */}
        {items.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground">
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-4xl">🛒</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                      </h3>
                      <p className="text-primary-foreground/80 mb-4">Ready to checkout?</p>
                      <Link href="/cart">
                        <Button variant="secondary" size="lg">
                          View Cart
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
  </Layout>
  )
}