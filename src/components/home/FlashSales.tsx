'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { ShoppingCart, Clock } from 'lucide-react'

function useCountdown(target: Date) {
  const [now, setNow] = useState<Date>(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, target.getTime() - now.getTime())
  const time = useMemo(() => {
    const s = Math.floor(diff / 1000)
    const d = Math.floor(s / 86400)
    const h = Math.floor((s % 86400) / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return { d, h, m, s: sec }
  }, [diff])
  return time
}

export default function FlashSales({
  products,
  onAddToCartAction,
}: {
  products: Product[]
  onAddToCartAction: (p: Product) => void
}) {
  const target = useMemo(() => new Date(Date.now() + 1000 * 60 * 60 * 6), []) // +6h
  const { d, h, m, s } = useCountdown(target)

  const sale = products.slice(0, 4)

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1.5 rounded bg-red-600" />
            <h2 className="text-2xl font-bold">Flash Sales</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="tabular-nums">{d}d {h}h {m}m {s}s</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sale.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-4xl">🛍️</span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="font-semibold line-clamp-1 mb-1">{p.name}</div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">${p.price.toFixed(2)}</span>
                  <Button size="sm" onClick={() => onAddToCartAction(p)}>
                    <ShoppingCart className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
