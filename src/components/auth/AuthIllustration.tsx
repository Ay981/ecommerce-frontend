"use client";
import Image from 'next/image';

interface AuthIllustrationProps {
  alt?: string;
  className?: string;
}

export function AuthIllustration({ alt = 'E-commerce illustration', className }: AuthIllustrationProps) {
  return (
    <div className={"rounded-xl overflow-hidden bg-muted/20 dark:bg-white/5 p-0 " + (className||'')}>      
      <div className="relative aspect-[4/3] w-full">
        <Image 
          src="/auth/ecommerce-hero.jpg" 
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/60 mix-blend-multiply" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl md:text-5xl font-bold text-white tracking-wide drop-shadow">Shop Smarter</span>
        </div>
      </div>
    </div>
  );
}
