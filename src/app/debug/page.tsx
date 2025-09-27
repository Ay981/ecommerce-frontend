'use client'

import { useEffect, useState } from 'react'

interface BackendPing {
  env: Record<string, unknown>
  checks: {
    products: { ok: boolean; status: number | null; url: string; error?: string }
    registerOptions: { ok: boolean; status: number | null; url: string; allow?: string | null; error?: string }
  }
  guidance?: string
}

export default function DebugPage() {
  const [data, setData] = useState<BackendPing | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string>('')

  useEffect(() => {
    fetch('/api/backend-ping')
      .then(r => r.json())
      .then(setData)
      .catch(e => setErr(e.message))
      .finally(()=> setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto text-sm">
      <h1 className="text-2xl font-bold mb-4">Backend Connectivity Debug</h1>
      {loading && <p>Running checks…</p>}
      {err && <p className="text-red-600">Failed: {err}</p>}
      {data && (
        <div className="space-y-6">
          <section>
            <h2 className="font-semibold mb-2">Environment</h2>
            <pre className="bg-muted p-3 rounded overflow-auto text-xs">{JSON.stringify(data.env, null, 2)}</pre>
          </section>
          <section>
            <h2 className="font-semibold mb-2">Checks</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {(['products','registerOptions'] as const).map(key => {
                const item = data.checks[key as keyof BackendPing['checks']]
                return (
                  <div key={key} className="border rounded p-3">
                    <h3 className="font-medium mb-1">{key}</h3>
                    <p className="mb-1"><span className="font-mono">{item.url}</span></p>
                    <p>Status: {item.status ?? '—'} {item.ok ? '✅' : '❌'}</p>
                    {'allow' in item && item.allow && <p>Allow: {item.allow}</p>}
                    {item.error && <p className="text-red-600">Error: {item.error}</p>}
                  </div>
                )
              })}
            </div>
          </section>
          {data.guidance && (
            <section>
              <h2 className="font-semibold mb-2">Guidance</h2>
              <p className="text-muted-foreground leading-relaxed">{data.guidance}</p>
            </section>
          )}
        </div>
      )}
      <p className="mt-8 text-xs text-muted-foreground">Remove /debug route after resolving connectivity issues.</p>
    </div>
  )
}
