export const runtime = 'nodejs'

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

  const [products, registerOptions, registerPost, loginOptions, loginPost, proxyRegisterOptions, proxyLoginOptions] = await Promise.all([
    safeFetch(productsUrl),
    safeFetch(registerOptionsUrl, { method: 'OPTIONS' }, true),
    safeFetch(registerPostUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'ping-temp-'+Date.now()+"@example.com", password: 'Test1234!', username: 'pinguser' }) }),
    safeFetch(loginOptionsUrl, { method: 'OPTIONS' }, true),
    safeFetch(loginPostUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'nonexistent_'+Date.now()+"@example.com", password: 'WrongPass123' }) }),
    proxyRegisterOptionsUrl ? safeFetch(proxyRegisterOptionsUrl, { method: 'OPTIONS' }, true) : Promise.resolve({ ok: false, status: null, url: 'proxy-disabled' }),
    proxyLoginOptionsUrl ? safeFetch(proxyLoginOptionsUrl, { method: 'OPTIONS' }, true) : Promise.resolve({ ok: false, status: null, url: 'proxy-disabled' }),
  ])

  return Response.json({
    env: {
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
      resolvedBase: base,
        useProxy,
      nodeEnv: process.env.NODE_ENV,
    },
    checks: {
      products,
      registerOptions,
      registerPost,
      loginOptions,
      loginPost,
      proxyRegisterOptions,
      proxyLoginOptions,
    },
    guidance: products.ok ? undefined : 'If products shows network error: confirm API base URL, HTTPS vs HTTP mixed content, and CORS. A FETCH_ERROR (no status) usually signals DNS failure, blocked mixed content, or CORS preflight rejection. The registerPost attempt helps distinguish application 4xx/5xx vs network.',
    notes: {
      proxyHint: useProxy ? 'Proxy test uses absolute URL derived from NEXT_PUBLIC_SITE_ORIGIN or fallback localhost:3001.' : 'Proxy disabled',
      server500: 'Status 500 on products/login/register means the backend itself errored (not a network/CORS issue). Check backend logs or database/migrations.'
    }
  })
}
