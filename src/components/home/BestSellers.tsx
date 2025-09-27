'use client'

import { useGetProductsQuery, type Product, useAddToCartMutation } from '@/lib/api'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { addItem } from '@/lib/features/cart/cartSlice'
import { ProductCard } from '@/components/ui/ProductCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function BestSellers({ onAddToCartAction }: { onAddToCartAction?: (p: Product) => void }) {
  const { data: productsResp } = useGetProductsQuery({ page: 1, pageSize: 50 })
  const top = (productsResp?.results || []).slice(0, 8)
  const { isAuthenticated } = useAppSelector(s => s.auth)
  const [addToCart] = useAddToCartMutation()
  const dispatch = useAppDispatch()

  const handleAdd = async (p: Product) => {
    if (onAddToCartAction) return onAddToCartAction(p)
    if (isAuthenticated) {
      try { await addToCart({ product_id: p.id, quantity: 1 }).unwrap() } catch {/* ignore */}
    } else {
      dispatch(addItem({ product: p, quantity: 1 }))
    }
  }
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Best Sellers</h2>
            <p className="text-muted-foreground">Most popular products this week</p>
          </div>
          <Link href="/products"><Button variant="outline">View All</Button></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {top.map(p => (
            <ProductCard key={p.id} product={p} onAddToCart={handleAdd} />
          ))}
        </div>
      </div>
    </section>
  )
}
