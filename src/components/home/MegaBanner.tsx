'use client'

import { Button } from '@/components/ui/Button'

export default function MegaBanner() {
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_40%)]" />
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="mb-2 inline-block rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200">New</div>
              <h3 className="text-3xl md:text-4xl font-bold mb-2">Enhance Your Music Experience</h3>
              <p className="text-white/80 mb-6">Premium sound with deep bass and long battery life.</p>
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-200">Shop Now</Button>
            </div>
            <div className="flex-1 min-h-[180px] w-full grid place-items-center">
              <div className="h-40 w-40 md:h-56 md:w-56 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 grid place-items-center shadow-2xl">🔊</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
