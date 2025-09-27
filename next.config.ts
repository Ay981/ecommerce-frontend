import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

// Wire next-intl plugin with our i18n config
const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    turbo: {
      root: __dirname,
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
}

export default withNextIntl(nextConfig)
