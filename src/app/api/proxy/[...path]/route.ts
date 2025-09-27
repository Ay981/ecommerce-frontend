// Generic proxy to backend API to avoid direct browser CORS issues.
// Enable by setting NEXT_PUBLIC_USE_API_PROXY=true so the RTK baseQuery targets this route.
// It forwards requests to `${NEXT_PUBLIC_API_BASE_URL}` preserving the /api/v1/... path.
// NOTE: Only use for public data or authenticated bearer token forwarding (Authorization header passed through).

export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

const HOP_BY_HOP = new Set([
  'connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailer','transfer-encoding','upgrade'
])

async function handleProxy(req: NextRequest, params: { path?: string[] }) {
  const backendBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')
  if (!backendBase) {
    return new Response(JSON.stringify({ detail: 'Backend base URL not configured.' }), { status: 500, headers: { 'Content-Type':'application/json' } })
  }
  const pathSegs = params.path || []
  let targetPath = '/' + pathSegs.map(encodeURIComponent).join('/')
  // Preserve trailing slash from original request (Next dynamic route strips it)
  const hadTrailing = req.nextUrl.pathname.endsWith('/')
  if (hadTrailing && !targetPath.endsWith('/')) {
    targetPath += '/'
  }
  const search = req.nextUrl.search || ''
  const targetUrl = backendBase + targetPath + search

  // Internal redirect-follow (relative API paths) to avoid browser loop
  const originalMethod = req.method
  const originalBody = !['GET','HEAD','OPTIONS'].includes(req.method) ? await req.arrayBuffer() : undefined
  let currentUrl = targetUrl
  let method = originalMethod
  let body = originalBody
  let upstream: Response | undefined
  for (let i=0;i<5;i++) {
    const init: RequestInit = {
      method,
      headers: Object.fromEntries(
        Array.from(req.headers.entries())
          .filter(([k]) => !HOP_BY_HOP.has(k.toLowerCase()) && k.toLowerCase() !== 'host')
      ),
      // We follow manually via loop, so prevent auto-follow
      redirect: 'manual',
      body: body,
    }
    try {
      upstream = await fetch(currentUrl, init)
    } catch (e) {
      return new Response(JSON.stringify({
        detail: 'Proxy upstream fetch failed',
        error: (e as Error).message,
        target: currentUrl,
      }), { status: 502, headers: { 'Content-Type':'application/json' } })
    }
    if (![301,302,307,308].includes(upstream.status)) break
    const loc = upstream.headers.get('location')
    if (!loc) break
    // Detect loop (same location after rewrite attempt)
    const relative = loc.startsWith('/')
    const nextUrl = relative ? (backendBase + loc) : loc
    if (nextUrl === currentUrl) {
      // Abort loop
      return new Response(JSON.stringify({ detail: 'Redirect loop detected at upstream', location: loc }), { status: 508, headers: { 'Content-Type':'application/json' } })
    }
    // Adjust method semantics: 301/302 switch to GET (browser behavior), 307/308 keep method & body
    if (upstream.status === 301 || upstream.status === 302) {
      method = 'GET'
      body = undefined
    }
    currentUrl = nextUrl
    // Continue loop to fetch next
  }
  if (!upstream) {
    return new Response(JSON.stringify({ detail: 'Proxy failed to obtain upstream response' }), { status: 500, headers: { 'Content-Type':'application/json' } })
  }
  const respHeaders = new Headers()
  upstream.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return
    if (key.toLowerCase() === 'content-security-policy') return
    respHeaders.set(key, value)
  })
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: respHeaders })
}

// Route handlers must use the standard context shape: { params: { path: string[] } }
// Accept context where params might be a Promise (type inference quirk in some Next builds)
type MaybePromise<T> = T | Promise<T>
type RouteCtx = { params: MaybePromise<{ path?: string[] }> }

async function resolveParams(p: MaybePromise<{ path?: string[] }>): Promise<{ path?: string[] }> {
  return await p
}

export async function GET(req: NextRequest, ctx: RouteCtx) { return handleProxy(req, await resolveParams(ctx.params)) }
export async function POST(req: NextRequest, ctx: RouteCtx) { return handleProxy(req, await resolveParams(ctx.params)) }
export async function PUT(req: NextRequest, ctx: RouteCtx) { return handleProxy(req, await resolveParams(ctx.params)) }
export async function PATCH(req: NextRequest, ctx: RouteCtx) { return handleProxy(req, await resolveParams(ctx.params)) }
export async function DELETE(req: NextRequest, ctx: RouteCtx) { return handleProxy(req, await resolveParams(ctx.params)) }
export async function OPTIONS(req: NextRequest, ctx: RouteCtx) { return handleProxy(req, await resolveParams(ctx.params)) }
