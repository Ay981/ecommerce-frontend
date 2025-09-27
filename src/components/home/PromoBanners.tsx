'use client'

import Link from 'next/link'

export default function PromoBanners() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/products" className="rounded-xl p-8 bg-gradient-to-br from-orange-400 to-pink-500 text-white">
          <h3 className="text-2xl font-bold mb-2">Summer Sale</h3>
          <p>Up to 50% off selected items</p>
        </Link>
        <Link href="/products" className="rounded-xl p-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <h3 className="text-2xl font-bold mb-2">New Arrivals</h3>
          <p>Latest products in store now</p>
        </Link>
        <Link href="/products" className="rounded-xl p-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <h3 className="text-2xl font-bold mb-2">Free Shipping</h3>
          <p>On orders over $50</p>
        </Link>
      </div>
    </section>
  )
}
