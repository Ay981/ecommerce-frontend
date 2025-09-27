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
  if (!raw) return { global: 'Something went wrong. Please try again.' }

  // RTK Query error shape often: { status, data }
  const rawObj = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : undefined
  const status = rawObj?.status as number | string | undefined
  const data = (rawObj?.data as Record<string, unknown> | undefined)
  // Detect proxy/front-end 404 HTML returned instead of JSON (misconfigured proxy or dev server not restarted)
  if (status === 'PARSING_ERROR' && typeof data === 'string' && /<!DOCTYPE html>/i.test(data)) {
    return { global: 'Unexpected HTML response (likely local proxy/route 404). Restart dev server so /api/proxy route is registered or disable proxy flag.' }
  }
  // Generic parsing error (often backend returned HTML 500 or non-JSON error page)
  if (status === 'PARSING_ERROR') {
    return { global: 'Server returned an unexpected (non-JSON) response. This usually means the backend errored (500) and sent an HTML error page. Check backend logs / migrations.' }
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

  if (data && typeof data === 'object') {
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
      }
      return { fieldErrors }
    }
  }

  return { global: 'Could not complete the request. Please try again.' }
}

export function renderFieldErrors(fieldErrors?: Record<string,string>): Array<{ fieldLabel: string; message: string }> {
  if (!fieldErrors) return []
  return Object.entries(fieldErrors).map(([k,v]) => ({ fieldLabel: prettifyField(k), message: v }))
}
