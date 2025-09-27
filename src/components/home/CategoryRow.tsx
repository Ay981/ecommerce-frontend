'use client'

import Link from 'next/link'
import type { Category } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'

export default function CategoryRow({ categories }: { categories: Category[] }) {
  const cats = categories.slice(0, 6)
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-5 w-1.5 rounded bg-red-600" />
          <h2 className="text-2xl font-bold">Browse By Category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {cats.map((c) => (
            <Link key={c.id} href={`/categories/${c.id}`}>
              <Card className="group hover:shadow-lg transition-all">
                <CardContent className="p-4 text-center">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-muted flex items-center justify-center">🏷️</div>
                  <div className="font-medium group-hover:text-primary">{c.name}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
