'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
]

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const handleLanguageChange = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  // const currentLanguage = languages.find(lang => lang.code === locale)

  return (
    <div className="relative group">
      <Button variant="ghost" size="icon" className="relative">
        <Globe className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Change language</span>
      </Button>
      
  <div className="absolute right-0 mt-2 w-48 bg-card rounded-md border shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center space-x-2 ${
              locale === language.code ? 'bg-blue-50 dark:bg-blue-900' : ''
            }`}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
            {locale === language.code && (
              <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
