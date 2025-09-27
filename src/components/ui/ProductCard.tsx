'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/api'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  className?: string
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const isOutOfStock = product.stock_quantity === 0

  return (
    <Card className={cn('group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1', className)}>
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="relative block">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden">
            {/* Placeholder for product image */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-sm text-muted-foreground">No Image</p>
            </div>
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                <Button size="icon" variant="secondary" className="h-10 w-10">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" className="h-10 w-10">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Link>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-2">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-muted-foreground">
                Stock: {product.stock_quantity}
              </span>
            </div>
            
            <Badge variant={isOutOfStock ? "destructive" : "secondary"}>
              {isOutOfStock ? "Out of Stock" : "In Stock"}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
