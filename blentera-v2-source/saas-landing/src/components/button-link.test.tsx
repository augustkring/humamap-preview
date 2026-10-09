import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ButtonLink } from '@/components/button-link'

describe('ButtonLink', () => {
  it("keeps the outline variant's border instead of the transparent base one", () => {
    render(
      <ButtonLink href="/" variant="outline">
        Home
      </ButtonLink>,
    )

    const link = screen.getByRole('link', { name: 'Home' })
    expect(link).toHaveClass('border-border')
    expect(link).not.toHaveClass('border-transparent')
  })
})
