import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { HomeLink } from '@/components/home-link'

describe('HomeLink', () => {
  it('scrolls back to the top when clicked on the home page, where Next would keep the scroll', async () => {
    const scrollTo = vi.fn<(options: ScrollToOptions) => void>()
    vi.stubGlobal('scrollTo', scrollTo)
    const user = userEvent.setup()
    render(<HomeLink aria-label="Home">Logo</HomeLink>)

    await user.click(screen.getByRole('link', { name: 'Home' }))

    expect(scrollTo).toHaveBeenCalledWith({ top: 0 })
  })
})
