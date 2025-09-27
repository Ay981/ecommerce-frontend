import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
 
// Can be imported from a shared config
export const locales = ['en', 'es', 'fr'] as const
export type Locale = typeof locales[number]
 
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const loc = (locale ?? 'en') as Locale
  if (!locales.includes(loc)) notFound()
 
  return {
    locale: loc,
    messages: (await import(`../messages/${loc}.json`)).default,
  }
})
