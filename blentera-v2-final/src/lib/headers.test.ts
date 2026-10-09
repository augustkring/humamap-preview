import { describe, expect, it } from 'vitest'

import { responseHeaders } from '@/lib/headers'

function keys(indexable: boolean) {
  return responseHeaders({ indexable }).map((header) => header.key)
}

describe('responseHeaders', () => {
  it('sends the security headers on every build', () => {
    for (const indexable of [true, false]) {
      expect(keys(indexable)).toEqual(
        expect.arrayContaining([
          'Content-Security-Policy',
          'X-Frame-Options',
          'X-Content-Type-Options',
          'Referrer-Policy',
          'Permissions-Policy',
        ]),
      )
    }
  })

  it('says noindex only where the site must stay out of search', () => {
    expect(keys(true)).not.toContain('X-Robots-Tag')
    expect(keys(false)).toContain('X-Robots-Tag')
  })
})
