import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { JsonLd } from '@/components/json-ld'

describe('JsonLd', () => {
  it('escapes every "<", so no string in the data can close the script tag', () => {
    const data = { text: 'Run `apply <code>`, then </script><script>alert(1)</script>' }
    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script')

    expect(script?.innerHTML).not.toContain('<')
    expect(JSON.parse(script?.textContent ?? '')).toEqual(data)
  })
})
