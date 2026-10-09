'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import * as React from 'react'

import { useToggleTheme } from '@/hooks/use-toggle-theme'

function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  )
}

function ThemeHotkey() {
  const toggleTheme = useToggleTheme()

  // An Effect Event always sees the current theme, so the listener is added once instead of on every change.
  const onKeyDown = React.useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.repeat) {
      return
    }

    if (event.metaKey || event.ctrlKey || event.altKey) {
      return
    }

    if (event.key.toLowerCase() !== 'd') {
      return
    }

    if (isTypingTarget(event.target)) {
      return
    }

    toggleTheme()
  })

  React.useEffect(() => {
    const listener = (event: KeyboardEvent) => onKeyDown(event)
    window.addEventListener('keydown', listener)

    return () => {
      window.removeEventListener('keydown', listener)
    }
  }, [])

  return null
}

export { ThemeProvider }
