// Central place to convert backend / network error shapes into user friendly messages
// Extend as new patterns appear.

export interface NormalizedError {
  global?: string
  fieldErrors?: Record<string, string>
}

// Map backend field names to human readable labels
const FIELD_LABELS: Record<string, string> = {
  first_name: 'First name',
  last_name: 'Last name',
  email: 'Email',
  password: 'Password',
  username: 'Username',
  detail: 'Error',
}

function prettifyField(field: string) {
  return FIELD_LABELS[field] || field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// Known backend detail messages we want to rewrite
const DETAIL_MAP: Record<string, string> = {
  'No active account found with the given credentials': 'Incorrect email or password.',
  'Unable to log in with provided credentials.': 'Incorrect email or password.',
  'User account is disabled.': 'Your account has been disabled. Contact support.',
}

export function normalizeAuthError(raw: unknown): NormalizedError {
  // Network style
  if (!raw) return { global: 'Unexpected error. Please retry.' }

  // RTK Query error shape commonly: { status, data, error }
  const rawObj = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : undefined
  const status = rawObj?.status as number | string | undefined
  const dataAny = rawObj?.data as unknown
  const errStr = typeof rawObj?.error === 'string' ? rawObj?.error : ''

  // Helper: capture first 140 chars of a string body for dev context (never in production to avoid leaking internals)
  const snippet = (body: string) => {
    if (process.env.NODE_ENV === 'development') {
      const trimmed = body.trim().replace(/\s+/g, ' ')
      return trimmed.length > 140 ? trimmed.slice(0, 137) + '…' : trimmed
    }
    return ''
  }

  // PARSING_ERROR means fetch succeeded but JSON parsing failed.
  if (status === 'PARSING_ERROR') {
    const bodyStr = typeof dataAny === 'string' ? dataAny : ''
    // HTML detection
    if (/<!DOCTYPE html>/i.test(bodyStr) || /<html[\s>]/i.test(bodyStr)) {
      // Common scenarios:
      // 1. Backend 500 exception (Django debug page / generic 500 template)
      // 2. 404/405 HTML due to missing trailing slash or wrong path
      // 3. Reverse proxy (nginx, platform) error page (502/503/504)
      const base = 'Server returned HTML instead of JSON.'
      if (/csrf/i.test(bodyStr)) {
        return { global: base + ' Contains CSRF text – ensure you are using JWT endpoints (not session auth) or exempt the view from CSRF.' }
      }
      if (/Method Not Allowed/i.test(bodyStr) || /405/i.test(bodyStr)) {
        return { global: base + ' Looks like a 405 Method Not Allowed. Verify the URL ends with a trailing slash (/auth/register/) and method is POST.' }
      }
      if (/<title>Server Error \(500\)<\/title>/i.test(bodyStr) || /Traceback \(most recent call last\)/i.test(bodyStr)) {
        return { global: base + ' Backend likely threw an exception (500). Check backend logs / run migrations.' }
      }
      return { global: base + ' Possibly wrong URL or backend exception. ' + (snippet(bodyStr) ? 'Snippet: "' + snippet(bodyStr) + '"' : '') }
    }
    if (bodyStr) {
      // Plain text (not JSON) – show concise snippet
      return { global: 'Unexpected non‑JSON response from server. ' + (snippet(bodyStr) ? 'Snippet: "' + snippet(bodyStr) + '"' : 'Check backend logs.') }
    }
    // Empty body
    return { global: 'Empty response body; server did not return JSON. Backend may have crashed or returned 204 unexpectedly.' }
  }

  if (status === 'FETCH_ERROR') {
    // Attempt to infer a more specific cause from embedded error string if present
    const errText = typeof (rawObj?.error as unknown) === 'string' ? String(rawObj?.error) : ''
    if (/dns|ENOTFOUND|NameResolution/i.test(errText)) return { global: 'Cannot reach server (DNS resolution failed). Check the API URL.' }
    if (/failed to fetch|TypeError: NetworkError/i.test(errText)) return { global: 'Connection failed before reaching the server. Possible CORS, mixed content (http vs https), or temporary network issue.' }
    if (/timeout/i.test(errText)) return { global: 'Request timed out contacting the server. Please retry.' }
    return { global: 'Network issue prevented the request. Please check your connection and retry.' }
  }
  if (status === 500) return { global: 'Server error. Please try again shortly.' }
  if (status === 405) return { global: 'Method not allowed (405). Verify you are using POST and the URL has a trailing slash.' }
  if (status === 404) return { global: 'Endpoint not found (404). Check the API base URL and path (/api/v1/auth/register/).' }

  if (dataAny && typeof dataAny === 'object') {
    const data = dataAny as Record<string, unknown>
    // If there is a simple detail string
    if (typeof data.detail === 'string') {
      const mapped = DETAIL_MAP[data.detail] || data.detail
      return { global: mapped }
    }

    // Collect field errors
    const fieldErrors: Record<string, string> = {}
  for (const [field, val] of Object.entries(data)) {
      if (field === 'detail') continue
      if (Array.isArray(val) && val.length) fieldErrors[field] = String(val[0])
      else if (typeof val === 'string') fieldErrors[field] = val
    }
    if (Object.keys(fieldErrors).length) {
      // Turn technical messages more friendly (simple heuristics)
      for (const k of Object.keys(fieldErrors)) {
        fieldErrors[k] = fieldErrors[k]
          .replace(/This field may not be blank\./i, 'Please enter a value.')
          .replace(/Ensure this field has at least (\d+) characters?\./i, 'Must be at least $1 characters.')
          .replace(/A user with that username already exists\./i, 'That username is already taken.')
          .replace(/user with this email address already exists/i, 'An account with this email already exists.')
      .replace(/unable to log in with provided credentials/i, 'Incorrect email or password.')
      .replace(/no active account found with the given credentials/i, 'Incorrect email or password.')
      }
      return { fieldErrors }
    }
  }

  // Fallback
  if (errStr) return { global: 'Request failed: ' + errStr }
  return { global: 'Could not complete the request. Please try again.' }
}

export function renderFieldErrors(fieldErrors?: Record<string,string>): Array<{ fieldLabel: string; message: string }> {
  if (!fieldErrors) return []
  return Object.entries(fieldErrors).map(([k,v]) => ({ fieldLabel: prettifyField(k), message: v }))
}
