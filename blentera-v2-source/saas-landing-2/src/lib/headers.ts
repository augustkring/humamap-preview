type Header = { key: string; value: string }

// A static CSP, since a nonce would make every page dynamic; it limits what needs no inline allowance.
const SECURITY_HEADERS: Header[] = [
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
]

// No imports here: next.config.ts loads this file, and its loader only resolves the @/ alias in the config itself.
export function responseHeaders({ indexable }: { indexable: boolean }): Header[] {
  if (indexable) return SECURITY_HEADERS
  // Previews and local builds say noindex in a header too, not only in the page's meta tag.
  return [...SECURITY_HEADERS, { key: 'X-Robots-Tag', value: 'noindex' }]
}
