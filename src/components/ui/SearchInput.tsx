'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string
}

export default function SearchInput({ className, containerClassName, ...props }: Props) {
  return (
    <div className={cn('relative', containerClassName)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        {...props}
        className={cn(
          'w-full pl-10 pr-4 h-10 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30',
          className
        )}
      />
    </div>
  )
}
