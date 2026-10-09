export type Env = Record<string, string | undefined>

// SITE_URL wins, then Vercel's production domain, so a fresh clone never points at the demo.
export function getSiteUrl(env: Env = process.env): string {
  if (env.SITE_URL) return originOf(env.SITE_URL)
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
  // An indexed site on localhost would hand search engines canonicals nobody can reach.
  if (isIndexable(env)) {
    throw new Error('SITE_ENV is production, so set SITE_URL to the public origin before building.')
  }
  return 'http://localhost:3000'
}

function originOf(siteUrl: string): string {
  try {
    return new URL(siteUrl).origin
  } catch {
    throw new Error(
      `SITE_URL must be an absolute URL, such as https://example.com, not "${siteUrl}".`,
    )
  }
}

// Only production belongs in search: Vercel's production deploys, or any host that sets SITE_ENV=production.
export function isIndexable(env: Env = process.env): boolean {
  return env.SITE_ENV === 'production' || env.VERCEL_ENV === 'production'
}
