import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SiteLink } from '@/components/site-link'

describe('SiteLink', () => {
  it('opens another site in a new tab without a referrer', () => {
    render(<SiteLink href="https://github.com/7ovr">Source</SiteLink>)

    const link = screen.getByRole('link', { name: 'Source' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
  })

  it('hands a mail link to the mail app in the same tab', () => {
    render(<SiteLink href="mailto:hello@7ovr.com">Email</SiteLink>)

    const link = screen.getByRole('link', { name: 'Email' })
    expect(link).toHaveAttribute('href', 'mailto:hello@7ovr.com')
    expect(link).not.toHaveAttribute('target')
  })

  it('keeps a page on this site in the same tab', () => {
    render(<SiteLink href="/#faq">FAQ</SiteLink>)

    const link = screen.getByRole('link', { name: 'FAQ' })
    expect(link).toHaveAttribute('href', '/#faq')
    expect(link).not.toHaveAttribute('target')
  })
})
