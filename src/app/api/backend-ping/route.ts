export const runtime = 'nodejs'

// Lightweight health probe retained for local development.
// In production this endpoint returns 404 unless explicitly enabled via ENABLE_BACKEND_PING=true
// to avoid leaking internal diagnostics.

interface PingResult {
  ok: boolean
  status: number | null
  url: string
  error?: string
  allow?: string | null
}

async function safeFetch(url: string, init?: RequestInit, captureAllow = false): Promise<PingResult> {
  try {
    const res = await fetch(url, { ...init, cache: 'no-store' })
    return {
      ok: res.ok,
      status: res.status,
      url,
      allow: captureAllow ? res.headers.get('Allow') : null,
    }
  } catch (e) {
    return { ok: false, status: null, url, error: (e as Error).message }
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development' && process.env.ENABLE_BACKEND_PING !== 'true') {
    return new Response('Not Found', { status: 404 })
  }
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '') + '/api/v1'
  const productsUrl = `${base}/shop/products/?page=1`
  const registerOptionsUrl = `${base}/auth/register/`
  const registerPostUrl = `${base}/auth/register/`
  const loginOptionsUrl = `${base}/auth/login/`
  const loginPostUrl = `${base}/auth/login/`

    const useProxy = process.env.NEXT_PUBLIC_USE_API_PROXY === 'true'
    // Compute site origin for absolute proxy test URLs. In dev allow override via NEXT_PUBLIC_SITE_ORIGIN (e.g. http://localhost:3001)
    const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001')
    const proxyRegisterOptionsUrl = useProxy ? `${siteOrigin}/api/proxy/api/v1/auth/register/` : null
    const proxyLoginOptionsUrl = useProxy ? `${siteOrigin}/api/proxy/api/v1/auth/login/` : null

  // Additional checks: categories list and token refresh endpoints
  const categoriesUrl = `${base}/shop/categories/`
  const refreshOptionsUrl = `${base}/auth/token/refresh/`
  const refreshPostUrl = `${base}/auth/token/refresh/`
  const proxyRefreshOptionsUrl = useProxy ? `${siteOrigin}/api/proxy/api/v1/auth/token/refresh/` : null

  const [products, registerOptions, registerPost, loginOptions, loginPost, proxyRegisterOptions, proxyLoginOptions,
    categories, refreshOptions, refreshPost, proxyRefreshOptions
  ] = await Promise.all([
    safeFetch(productsUrl),
    safeFetch(registerOptionsUrl, { method: 'OPTIONS' }, true),
    safeFetch(registerPostUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'ping-temp-'+Date.now()+"@example.com", password: 'Test1234!', username: 'pinguser' }) }),
    safeFetch(loginOptionsUrl, { method: 'OPTIONS' }, true),
    safeFetch(loginPostUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'nonexistent_'+Date.now()+"@example.com", password: 'WrongPass123' }) }),
    proxyRegisterOptionsUrl ? safeFetch(proxyRegisterOptionsUrl, { method: 'OPTIONS' }, true) : Promise.resolve({ ok: false, status: null, url: 'proxy-disabled' }),
    proxyLoginOptionsUrl ? safeFetch(proxyLoginOptionsUrl, { method: 'OPTIONS' }, true) : Promise.resolve({ ok: false, status: null, url: 'proxy-disabled' }),
    safeFetch(categoriesUrl),
    safeFetch(refreshOptionsUrl, { method: 'OPTIONS' }, true),
    safeFetch(refreshPostUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh: 'dummy-refresh-token' }) }),
    proxyRefreshOptionsUrl ? safeFetch(proxyRefreshOptionsUrl, { method: 'OPTIONS' }, true) : Promise.resolve({ ok: false, status: null, url: 'proxy-disabled' }),
  ])

  return Response.json({
    env: { base, useProxy },
    checks: {
      products,
      registerOptions,
      registerPost,
      loginOptions,
      loginPost,
      proxyRegisterOptions,
      proxyLoginOptions,
      categories,
      refreshOptions,
      refreshPost,
      proxyRefreshOptions,
    },
  })
}
