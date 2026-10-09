import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { stripInlineCode, withInlineCode } from '@/lib/inline-code'

describe('inline code', () => {
  it('renders backticked spans as code and keeps the rest as text', () => {
    const { container } = render(<p>{withInlineCode('Run `pnpm dev`, then `pnpm build`.')}</p>)

    const code = [...container.querySelectorAll('code')].map((node) => node.textContent)
    expect(code).toEqual(['pnpm dev', 'pnpm build'])
    expect(container).toHaveTextContent('Run pnpm dev, then pnpm build.')
  })

  it('strips the backticks for plain text, such as JSON-LD', () => {
    expect(stripInlineCode('Run `pnpm dev`.')).toBe('Run pnpm dev.')
  })
})
