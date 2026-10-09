import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CopyCommand } from '@/components/copy-command'

describe('CopyCommand', () => {
  it('copies the command and announces it', async () => {
    const user = userEvent.setup()
    render(<CopyCommand command="git clone https://github.com/7ovr/shadcn-next-starter" />)

    await user.click(screen.getByRole('button', { name: 'Copy Command' }))

    expect(await navigator.clipboard.readText()).toBe(
      'git clone https://github.com/7ovr/shadcn-next-starter',
    )
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Copied')
  })

  it('claims nothing when the clipboard refuses the write', async () => {
    const user = userEvent.setup()
    render(<CopyCommand command="pnpm install" />)
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Denied'))

    await user.click(screen.getByRole('button', { name: 'Copy Command' }))

    expect(screen.getByRole('button', { name: 'Copy Command' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})
