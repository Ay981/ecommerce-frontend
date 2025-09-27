'use client'

import type { Product } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export default function ExploreGrid({ products, onAddAction }: { products: Product[]; onAddAction: (p: Product) => void }) {
  const items = products.slice(0, 8)
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1.5 rounded bg-red-600" />
            <h2 className="text-2xl font-bold">Explore Our Products</h2>
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p) => (
            <Card key={p.id}>
              <CardHeader className="p-0">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 grid place-items-center">📦</div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="font-semibold line-clamp-1 mb-1">{p.name}</div>
                <div className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">${p.price.toFixed(2)}</span>
                  <Button size="sm" onClick={() => onAddAction(p)}>Add</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export function NewArrival({ products }: { products: Product[] }) {
  const items = products.slice(0, 3)
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-5 w-1.5 rounded bg-red-600" />
          <h2 className="text-2xl font-bold">New Arrival</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 grid place-items-center min-h-[220px]">✨ {p.name}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
