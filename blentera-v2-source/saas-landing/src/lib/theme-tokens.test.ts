import { describe, expect, it } from 'vitest'

import { readRootTokens, toHex } from '@/lib/theme-tokens'

describe('toHex', () => {
  it('turns the neutral oklch tokens into the hex Satori reads', () => {
    expect(toHex('oklch(1 0 0)')).toBe('#ffffff')
    expect(toHex('oklch(0.145 0 0)')).toBe('#0a0a0a')
    expect(toHex('oklch(0.556 0 0)')).toBe('#737373')
    expect(toHex('oklch(0.922 0 0)')).toBe('#e5e5e5')
  })

  it('converts a colour with a hue, written with or without a percentage', () => {
    expect(toHex('oklch(0.577 0.245 27.325)')).toBe('#e7000b')
    expect(toHex('oklch(57.7% 0.245 27.325)')).toBe('#e7000b')
  })

  it('passes hex through and gives up on what it cannot convert', () => {
    expect(toHex('#1D4ED8')).toBe('#1d4ed8')
    expect(toHex('oklch(1 0 0 / 10%)')).toBeNull()
    expect(toHex('var(--primary)')).toBeNull()
  })
})

describe('readRootTokens', () => {
  it('reads the light theme and leaves the dark one alone', () => {
    const css =
      ':root {\n  --background: oklch(1 0 0);\n  --radius: 0.625rem;\n}\n\n.dark {\n  --background: oklch(0.145 0 0);\n}'

    expect(readRootTokens(css)).toEqual({ background: 'oklch(1 0 0)', radius: '0.625rem' })
  })
})
