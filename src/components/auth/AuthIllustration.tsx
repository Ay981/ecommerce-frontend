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
          src="/auth/ecommerce-hero.svg" 
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover brightness-110 contrast-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-white/10 mix-blend-screen" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-center">
          <span className="text-xs font-medium tracking-wide text-white/80 drop-shadow-sm">ALX Ecommerce</span>
        </div>
      </div>
    </div>
  );
}
