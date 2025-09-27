'use client'

import { NextIntlClientProvider } from 'next-intl'
import { useLocale } from 'next-intl'

type Messages = Record<string, string>

export default function IntlProvider({
  children,
  messages,
}: {
  children: React.ReactNode
  messages: Messages
}) {
  const locale = useLocale()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
