import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// next/font only runs inside the Next compiler, so tests get a stand-in with the same shape.
vi.mock('next/font/google', () => ({
  Syne: () => ({ className: 'font-syne', style: { fontFamily: 'Syne' } }),
}))

function noop() {}

// jsdom lacks these browser APIs, which next-themes and Base UI reach for.
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: noop,
  removeEventListener: noop,
  addListener: noop,
  removeListener: noop,
  dispatchEvent: () => false,
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
